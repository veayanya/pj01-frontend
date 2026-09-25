// Base URL backend parth-dl (Render) + API key opsional, dibaca dari env
// Vite (VITE_API_BASE, VITE_API_KEY). Kosongkan keduanya kalau frontend &
// backend disajikan dari origin yang sama (mis. lewat `parth-dl serve` lokal
// atau reverse proxy) — semua panggilan lalu jatuh ke path relatif seperti
// sebelumnya.
const API_BASE = import.meta.env.VITE_API_BASE || ''
const API_KEY = import.meta.env.VITE_API_KEY || ''

export function apiUrl(path) {
  return API_BASE
    ? API_BASE.replace(/\/+$/, '') + '/' + path.replace(/^\/+/, '')
    : path
}

export async function apiFetch(path, opts = {}) {
  const res = await fetch(apiUrl(path), {
    headers: {
      Accept: 'application/json',
      ...(API_KEY ? { 'X-Api-Key': API_KEY } : {}),
      ...(opts.headers || {}),
    },
    ...opts,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'HTTP ' + res.status)
  return data
}

export function apiPost(path, body) {
  return apiFetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
