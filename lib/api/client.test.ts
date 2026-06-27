import { afterEach, describe, expect, it, vi } from 'vitest'
import { clientFetch } from './client'

function mockFetchOnce(status: number, json: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_url: string, _init?: RequestInit) =>
      ({ status, json: async () => json }) as unknown as Response,
    ),
  )
}

afterEach(() => vi.unstubAllGlobals())

describe('clientFetch', () => {
  it('desenvuelve data en éxito', async () => {
    mockFetchOnce(200, { ok: true, message: 'ok', data: { id: 1 } })
    await expect(clientFetch<{ id: number }>('clients/1')).resolves.toEqual({ id: 1 })
  })

  it('lanza error cuando ok:false', async () => {
    mockFetchOnce(400, { ok: false, message: 'Credenciales inválidas', path: '/x' })
    await expect(clientFetch('clients')).rejects.toThrow('Credenciales inválidas')
  })

  it('lanza si el cuerpo no es JSON válido', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, _init?: RequestInit) => ({
        status: 500,
        json: async () => { throw new SyntaxError('bad json') },
      }) as unknown as Response),
    )
    await expect(clientFetch('clients')).rejects.toThrow('Respuesta inválida del servidor')
  })

  it('antepone el prefijo del proxy a la ruta', async () => {
    const spy = vi.fn(async (_url: string, _init?: RequestInit) => ({
      status: 200,
      json: async () => ({ ok: true, message: '', data: 1 }),
    }) as unknown as Response)
    vi.stubGlobal('fetch', spy)
    await clientFetch('clients')
    expect(spy.mock.calls[0][0]).toBe('/api/proxy/clients')
  })
})
