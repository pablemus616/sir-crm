import { ApiError, unwrap, type ApiEnvelope } from './types'

export interface ClientFetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  params?: Record<string, string | number | boolean | undefined | null>
}

function buildPath(path: string, params?: ClientFetchOptions['params']): string {
  const base = `/api/proxy${path.startsWith('/') ? path : `/${path}`}`
  if (!params) return base
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) qs.set(key, String(value))
  }
  const search = qs.toString()
  return search ? `${base}?${search}` : base
}

export async function clientFetch<T>(path: string, init: ClientFetchOptions = {}): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')

  let body: BodyInit | undefined
  if (init.body !== undefined) {
    headers.set('Content-Type', 'application/json')
    body = JSON.stringify(init.body)
  }

  const res = await fetch(buildPath(path, init.params), {
    ...init,
    headers,
    body,
    credentials: 'same-origin',
  })

  const envelope = (await res.json().catch(() => null)) as ApiEnvelope<T> | null
  if (res.status === 401) {
    throw new ApiError(envelope?.message ?? 'No autenticado', 401)
  }
  if (!envelope) throw new ApiError('Respuesta inválida del servidor', res.status)
  return unwrap(envelope, res.status)
}
