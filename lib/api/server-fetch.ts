import 'server-only'
import { getAccessToken } from '@/lib/auth/cookies'
import { refreshSession } from '@/lib/auth/refresh'
import { ApiError, unwrap, type ApiEnvelope } from './types'

export interface ServerFetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  params?: Record<string, string | number | boolean | undefined | null>
}

export interface ServerResponse<T> {
  status: number
  envelope: ApiEnvelope<T> | null
}

function buildUrl(path: string, params?: ServerFetchOptions['params']): string {
  // Read SIR_API_URL dynamically (not at module-load time) so env overrides in tests work.
  const base = process.env.SIR_API_URL ?? ''
  const url = new URL(`${base}${path.startsWith('/') ? path : `/${path}`}`)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) url.searchParams.set(key, String(value))
    }
  }
  return url.toString()
}

async function rawFetch(url: string, token: string | undefined, init: ServerFetchOptions): Promise<Response> {
  const headers = new Headers(init.headers as HeadersInit | undefined)
  headers.set('Accept', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let body: BodyInit | undefined
  if (init.body !== undefined) {
    headers.set('Content-Type', 'application/json')
    body = JSON.stringify(init.body)
  }

  // cache: 'no-store' — session data must never be statically cached by Next.js.
  // In Next 16, fetches are uncached by default (opt-in via 'use cache'), but we
  // set this explicitly so the intent is clear even outside the Cache Components model.
  return fetch(url, { ...init, headers, body, cache: 'no-store' })
}

export async function serverRequest<T>(path: string, init: ServerFetchOptions = {}): Promise<ServerResponse<T>> {
  const url = buildUrl(path, init.params)
  const token = await getAccessToken()
  let res = await rawFetch(url, token, init)

  if (res.status === 401) {
    const newToken = await refreshSession()
    if (newToken) {
      res = await rawFetch(url, newToken, init)
    }
  }

  const envelope = (await res.json().catch(() => null)) as ApiEnvelope<T> | null
  return { status: res.status, envelope }
}

export async function serverFetch<T>(path: string, init: ServerFetchOptions = {}): Promise<T> {
  const { status, envelope } = await serverRequest<T>(path, init)
  if (!envelope) throw new ApiError('Respuesta inválida del servidor', status)
  return unwrap(envelope, status)
}
