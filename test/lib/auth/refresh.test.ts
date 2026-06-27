import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/auth/cookies', () => ({
  getRefreshToken: vi.fn(),
  setAuthCookies: vi.fn(),
  clearAuthCookies: vi.fn(),
}))

import { clearAuthCookies, getRefreshToken, setAuthCookies } from '@/lib/auth/cookies'
import { refreshSession } from '@/lib/auth/refresh'

const fetchMock = vi.fn()

beforeEach(() => {
  process.env.SIR_API_URL = 'http://api.test/api'
  vi.stubGlobal('fetch', fetchMock)
  vi.mocked(getRefreshToken).mockReset()
  vi.mocked(setAuthCookies).mockReset()
  vi.mocked(clearAuthCookies).mockReset()
  fetchMock.mockReset()
})

afterEach(() => vi.unstubAllGlobals())

describe('refreshSession', () => {
  it('devuelve null sin llamar al backend si no hay refresh token', async () => {
    vi.mocked(getRefreshToken).mockResolvedValue(undefined)
    expect(await refreshSession()).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rota ambas cookies y devuelve el nuevo access en éxito', async () => {
    vi.mocked(getRefreshToken).mockResolvedValue('old-refresh')
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true, message: 'ok', data: { accessToken: 'A2', refreshToken: 'R2' } }),
    })
    const token = await refreshSession()
    expect(token).toBe('A2')
    expect(setAuthCookies).toHaveBeenCalledWith('A2', 'R2')
    expect(clearAuthCookies).not.toHaveBeenCalled()
  })

  it('limpia cookies y devuelve null si el refresh falla', async () => {
    vi.mocked(getRefreshToken).mockResolvedValue('old-refresh')
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ ok: false, message: 'expirado' }),
    })
    expect(await refreshSession()).toBeNull()
    expect(clearAuthCookies).toHaveBeenCalledOnce()
    expect(setAuthCookies).not.toHaveBeenCalled()
  })
})
