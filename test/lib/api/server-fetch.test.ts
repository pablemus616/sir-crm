import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/auth/cookies', () => ({ getAccessToken: vi.fn() }))
vi.mock('@/lib/auth/refresh', () => ({ refreshSession: vi.fn() }))

import { getAccessToken } from '@/lib/auth/cookies'
import { refreshSession } from '@/lib/auth/refresh'
import { serverFetch } from '@/lib/api/server-fetch'
import { ApiError } from '@/lib/api/types'

const fetchMock = vi.fn()

beforeEach(() => {
  process.env.SIR_API_URL = 'http://api.test/api'
  vi.stubGlobal('fetch', fetchMock)
  vi.mocked(getAccessToken).mockReset()
  vi.mocked(refreshSession).mockReset()
  fetchMock.mockReset()
})

afterEach(() => vi.unstubAllGlobals())

const jsonRes = (status: number, body: unknown) => ({
  status,
  json: async () => body,
})

describe('serverFetch', () => {
  it('adjunta Bearer y devuelve data desenvuelta', async () => {
    vi.mocked(getAccessToken).mockResolvedValue('A1')
    fetchMock.mockResolvedValue(jsonRes(200, { ok: true, message: 'ok', data: { id: '7' } }))
    const data = await serverFetch<{ id: string }>('/auth/me')
    expect(data).toEqual({ id: '7' })
    const [, init] = fetchMock.mock.calls[0]
    expect((init.headers as Headers).get('Authorization')).toBe('Bearer A1')
  })

  it('ante 401 refresca y reintenta UNA vez con el nuevo token', async () => {
    vi.mocked(getAccessToken).mockResolvedValue('A1')
    vi.mocked(refreshSession).mockResolvedValue('A2')
    fetchMock
      .mockResolvedValueOnce(jsonRes(401, { ok: false, message: 'no auth' }))
      .mockResolvedValueOnce(jsonRes(200, { ok: true, message: 'ok', data: 42 }))
    const data = await serverFetch<number>('/metrics/overview')
    expect(data).toBe(42)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect((fetchMock.mock.calls[1][1].headers as Headers).get('Authorization')).toBe('Bearer A2')
  })

  it('lanza ApiError 401 si el refresh falla', async () => {
    vi.mocked(getAccessToken).mockResolvedValue('A1')
    vi.mocked(refreshSession).mockResolvedValue(null)
    fetchMock.mockResolvedValue(jsonRes(401, { ok: false, message: 'no auth' }))
    await expect(serverFetch('/clients')).rejects.toBeInstanceOf(ApiError)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
