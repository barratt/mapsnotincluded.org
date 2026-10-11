// Client for the world search API (VITE_SEARCH_API_URL).
//
// Every request carries an anonymous id and a browser fingerprint so fair-use
// limits work without an account; see the privacy page. Users who sign in
// with Steam also send their session token, which raises their daily limit.

import { browserFingerprint } from './fingerprint'

export const SEARCH_API_URL = import.meta.env.VITE_SEARCH_API_URL

const ANON_KEY = 'mni_anon_id'
const SESSION_KEY = 'mni_search_session'

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

export function getSession() {
  return storage('get', SESSION_KEY)
}

export function signOut() {
  storage('remove', SESSION_KEY)
}

// Steam sign-in returns to the site with "#mni_session=<token>".
export function captureSessionFromHash() {
  const match = /^#mni_session=([A-Za-z0-9_\-.]+)$/.exec(window.location.hash)
  if (!match) return false
  storage('set', SESSION_KEY, match[1])
  const url = new URL(window.location.href)
  url.hash = ''
  window.history.replaceState({}, '', url)
  return true
}

export function steamSignInUrl(returnTo = window.location.href) {
  return `${SEARCH_API_URL}/auth/steam?return_to=${encodeURIComponent(returnTo)}`
}

export async function headers() {
  const h = { 'Content-Type': 'application/json', 'X-MNI-Anon': anonId() }
  const fp = await browserFingerprint()
  if (fp) h['X-MNI-FP'] = fp
  const session = getSession()
  if (session) h.Authorization = `Bearer ${session}`
  return h
}

export async function api(path, { method = 'GET', body } = {}) {
  const response = await fetch(`${SEARCH_API_URL}${path}`, {
    method,
    headers: await headers(),
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  // An expired or revoked session: carry on anonymously.
  if (response.status === 401 && getSession()) signOut()
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
