// Generates worlds in the browser for the MNI index (the unlisted
// /contribute/browser page). The generator is the platform's own WebAssembly
// build (served to signed-in users only), run in one Web Worker per thread.
// Work comes from the worker API with the contributor's own API key, exactly
// like the native mni-worker: lease coordinates, generate, upload summaries.
// The platform spot-checks uploads, so only honest results stay in the index.

import { SEARCH_API_URL, api, headers } from './searchApi'

const WORKER_SOURCE = `
let mod = null
self.onmessage = async (e) => {
  const msg = e.data
  if (msg.type === 'init') {
    try {
      mod = await import(msg.moduleUrl)
      const text = atob(mod.WASM_BASE64)
      const bytes = new Uint8Array(text.length)
      for (let i = 0; i < text.length; i++) bytes[i] = text.charCodeAt(i)
      await mod.default({ module_or_path: bytes })
      mod.init()
      self.postMessage({ type: 'ready', generator: mod.generator_id(), version: mod.version(), clusters: JSON.parse(mod.clusters()) })
    } catch (err) {
      self.postMessage({ type: 'fatal', error: String((err && err.message) || err) })
    }
    return
  }
  if (msg.type === 'world') {
    const started = performance.now()
    let result
    try {
      result = { coordinate: msg.coordinate, output: JSON.parse(mod.summarise(msg.coordinate)) }
    } catch (err) {
      const text = String((err && err.message) || err)
      result = text.startsWith('Worldgen failure') ? { coordinate: msg.coordinate, worldgenFailure: text } : { coordinate: msg.coordinate, error: text }
    }
    result.ms = Math.round(performance.now() - started)
    self.postMessage({ type: 'result', result })
  }
}
`

const MACHINE_KEY = 'mni_web_worker_id'
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function machineId() {
  try {
    let id = localStorage.getItem(MACHINE_KEY)
    if (!id) {
      id = `web-${crypto.randomUUID().slice(0, 8)}`
      localStorage.setItem(MACHINE_KEY, id)
    }
    return id
  } catch {
    return `web-${crypto.randomUUID().slice(0, 8)}`
  }
}

function browserName() {
  const ua = navigator.userAgent
  const name = /Edg\//.test(ua) ? 'Edge' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Browser'
  return `${name} (browser)`
}

// onUpdate(state) is called whenever the stats change.
export function createBrowserWorker({ onUpdate }) {
  const state = {
    status: 'idle', // idle | loading | running | stopping | error
    message: '',
    version: null,
    threads: 0,
    work: 'auto',
    doing: null, // job | index | waiting
    generated: 0,
    accepted: 0,
    duplicates: 0,
    failures: 0,
    errors: 0,
    jobMatches: 0,
    recent: [], // timestamps of finished worlds, for the hourly rate
    control: null,
  }
  const emit = () => onUpdate({ ...state, rate: rate() })
  const rate = () => {
    const now = Date.now()
    state.recent = state.recent.filter((t) => now - t < 60000)
    return state.recent.length * 60
  }

  let key = null
  let moduleUrl = null
  let workers = []
  let clusters = []
  let machine = null
  let running = false
  const queue = [] // { coordinate, leaseId }
  const pending = new Map() // leaseId -> results waiting to upload
  let lastUpload = Date.now()

  async function workerApi(path, body) {
    const json = JSON.stringify(body)
    const init = { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: json }
    if (typeof CompressionStream === 'function') {
      init.body = await new Response(new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer()
      init.headers['Content-Encoding'] = 'gzip'
    }
    const res = await fetch(`${SEARCH_API_URL}${path}`, init)
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw Object.assign(new Error(data.error ?? `HTTP ${res.status}`), { status: res.status })
    return data
  }

  async function lease() {
    const want = Math.max(8, effectiveThreads() * 12)
    const reply = await workerApi('/worker/v1/lease', { machine, count: want, clusters, work: state.work })
    state.control = reply.control ?? null
    if (reply.message && !reply.coordinates?.length) state.message = reply.message
    if (!reply.coordinates?.length) {
      state.doing = 'waiting'
      emit()
      return Math.min(reply.pollAfterMs ?? 30000, 30000)
    }
    state.doing = reply.work === 'job' ? 'job' : 'index'
    state.message = ''
    for (const coordinate of reply.coordinates) queue.push({ coordinate, leaseId: reply.leaseId })
    emit()
    return 0
  }

  async function upload(force = false) {
    const total = [...pending.values()].reduce((n, list) => n + list.length, 0)
    if (!total || (!force && total < 100 && Date.now() - lastUpload < 15000)) return
    lastUpload = Date.now()
    for (const [leaseId, results] of [...pending.entries()]) {
      pending.delete(leaseId)
      try {
        const reply = await workerApi('/worker/v1/results', { leaseId, machine: machine.id, results })
        state.accepted += reply.accepted ?? 0
        state.duplicates += reply.duplicate ?? 0
        state.jobMatches += reply.jobMatches ?? 0
        state.control = reply.control ?? state.control
      } catch (err) {
        // Keep them for the next attempt (bounded), unless the platform refused the key.
        if (err.status === 401 || err.status === 403) return stop(err.message)
        if (results.length < 5000) pending.set(leaseId, [...(pending.get(leaseId) ?? []), ...results])
        state.message = `upload failed (${err.message}); retrying`
      }
    }
    emit()
  }

  const effectiveThreads = () => Math.max(1, Math.min(state.threads, state.control?.maxThreads ?? Infinity, workers.length || state.threads))

  // One loop per worker thread: take a coordinate, generate, record, pause
  // for the CPU limit.
  async function runSlot(worker, index) {
    while (running) {
      if (index >= effectiveThreads() || state.control?.paused) {
        await sleep(2000)
        continue
      }
      const item = queue.shift()
      if (!item) {
        await sleep(500)
        continue
      }
      const result = await new Promise((resolve) => {
        worker.onmessage = (e) => e.data.type === 'result' && resolve(e.data.result)
        worker.postMessage({ type: 'world', coordinate: item.coordinate })
      })
      state.generated++
      state.recent.push(Date.now())
      if (result.worldgenFailure) state.failures++
      if (result.error) state.errors++
      pending.set(item.leaseId, [...(pending.get(item.leaseId) ?? []), result])
      emit()
      const limit = state.control?.cpuLimit ?? 100
      if (limit < 100) await sleep(result.ms * (100 / Math.max(5, limit) - 1))
    }
  }

  async function feed() {
    while (running) {
      try {
        let wait = 0
        if (queue.length < effectiveThreads() * 4 && !state.control?.paused) wait = await lease()
        await upload()
        await sleep(wait || 1500)
      } catch (err) {
        if (err.status === 426) return stop('This browser worker is out of date: reload the page to get the current one.')
        if (err.status === 401 || err.status === 403) return stop(err.message)
        state.message = `${err.message}; retrying shortly`
        emit()
        await sleep(10000)
      }
    }
  }

  async function start({ threads, work }) {
    if (running) return
    state.status = 'loading'
    state.message = 'Loading the world generator…'
    state.threads = threads
    state.work = work
    emit()
    try {
      const keyReply = await api('/me/api-key')
      if (!keyReply.ok) throw new Error(keyReply.data?.message ?? 'sign in with Steam first')
      key = keyReply.data.key
      if (!moduleUrl) {
        const res = await fetch(`${SEARCH_API_URL}/worker/web/module`, { headers: await headers() })
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? `could not load the generator (HTTP ${res.status})`)
        moduleUrl = URL.createObjectURL(new Blob([await res.text()], { type: 'text/javascript' }))
      }
      const workerUrl = URL.createObjectURL(new Blob([WORKER_SOURCE], { type: 'text/javascript' }))
      workers = Array.from({ length: threads }, () => new Worker(workerUrl, { type: 'module' }))
      const ready = await Promise.all(
        workers.map(
          (w) =>
            new Promise((resolve, reject) => {
              w.onmessage = (e) => (e.data.type === 'ready' ? resolve(e.data) : e.data.type === 'fatal' ? reject(new Error(e.data.error)) : null)
              w.onerror = (e) => reject(new Error(e.message || 'worker failed to start'))
              w.postMessage({ type: 'init', moduleUrl })
            }),
        ),
      )
      clusters = ready[0].clusters
      state.version = ready[0].version
      machine = {
        id: machineId(),
        name: browserName(),
        os: 'web',
        arch: 'wasm32',
        version: ready[0].version,
        generator: ready[0].generator,
        threads,
        cpuLimit: 100,
        cores: navigator.hardwareConcurrency ?? 0,
      }
      running = true
      state.status = 'running'
      state.message = ''
      emit()
      workers.forEach((w, i) => runSlot(w, i))
      feed()
    } catch (err) {
      stop(err.message, 'error')
    }
  }

  async function stop(message = '', status = 'idle') {
    const wasRunning = running
    running = false
    state.status = wasRunning ? 'stopping' : status
    emit()
    if (wasRunning) await upload(true).catch(() => {})
    for (const w of workers) w.terminate()
    workers = []
    queue.length = 0
    state.status = status
    state.doing = null
    state.message = message
    emit()
  }

  return { start, stop, state: () => ({ ...state, rate: rate() }) }
}
