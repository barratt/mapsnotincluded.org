// Client for the world search API (VITE_SEARCH_API_URL).
//
// Every request carries an anonymous id and a browser fingerprint so fair-use
// limits work without an account; see the privacy page.

import { browserFingerprint } from './fingerprint'

export const SEARCH_API_URL = import.meta.env.VITE_SEARCH_API_URL

const ANON_KEY = 'mni_anon_id'

function storage(action, key, value) {
  try {
    if (action === 'get') return localStorage.getItem(key)
    if (action === 'set') localStorage.setItem(key, value)
    if (action === 'remove') localStorage.removeItem(key)
  } catch {
    return null
  }
}

function anonId() {
  let id = storage('get', ANON_KEY)
  if (!id) {
    id = crypto.randomUUID()
    storage('set', ANON_KEY, id)
  }
  return id
}

async function headers() {
  const h = { 'Content-Type': 'application/json', 'X-MNI-Anon': anonId() }
  const fp = await browserFingerprint()
  if (fp) h['X-MNI-FP'] = fp
  return h
}

export async function api(path, { method = 'GET', body } = {}) {
  const response = await fetch(`${SEARCH_API_URL}${path}`, {
    method,
    headers: await headers(),
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = await response.json().catch(() => ({}))
  return { ok: response.ok, status: response.status, data }
}

export function jobEvents(jobId, onProgress) {
  const source = new EventSource(`${SEARCH_API_URL}/jobs/${jobId}/events`)
  source.addEventListener('progress', (e) => onProgress(JSON.parse(e.data)))
  source.addEventListener('end', () => source.close())
  source.onerror = () => source.close()
  return () => source.close()
}
