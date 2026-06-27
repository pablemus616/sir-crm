import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { clientFetch } from '@/lib/api/client'
import { ApiError } from '@/lib/api/types'

const fetchMock = vi.fn()

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockReset()
})

afterEach(() => vi.unstubAllGlobals())

const jsonRes = (status: number, body: unknown) => ({
  status,
  json: async () => body,
})

const badJsonRes = (status: number) => ({
  status,
  json: async () => { throw new SyntaxError('Unexpected token') },
})

describe('clientFetch', () => {
  it('desenvuelve data en respuesta exitosa', async () => {
    fetchMock.mockResolvedValue(jsonRes(200, { ok: true, message: 'ok', data: { id: '42' } }))
    const data = await clientFetch<{ id: string }>('/clients')
    expect(data).toEqual({ id: '42' })
  })

  it('apunta a /api/proxy/<path>', async () => {
    fetchMock.mockResolvedValue(jsonRes(200, { ok: true, message: 'ok', data: null }))
    await clientFetch('/clients/1')
    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/proxy/clients/1')
  })

  it('agrega params como query string', async () => {
    fetchMock.mockResolvedValue(jsonRes(200, { ok: true, message: 'ok', data: [] }))
    await clientFetch('/clients', { params: { page: 2, limit: 10, search: 'foo' } })
    const [url] = fetchMock.mock.calls[0]
    expect(url).toContain('page=2')
    expect(url).toContain('limit=10')
    expect(url).toContain('search=foo')
  })

  it('omite params undefined/null de la query string', async () => {
    fetchMock.mockResolvedValue(jsonRes(200, { ok: true, message: 'ok', data: [] }))
    await clientFetch('/clients', { params: { page: 1, search: undefined, active: null } })
    const [url] = fetchMock.mock.calls[0]
    expect(url).not.toContain('search')
    expect(url).not.toContain('active')
  })

  it('envía credentials same-origin (sin Bearer header)', async () => {
    fetchMock.mockResolvedValue(jsonRes(200, { ok: true, message: 'ok', data: true }))
    await clientFetch('/me')
    const [, init] = fetchMock.mock.calls[0]
    expect(init.credentials).toBe('same-origin')
    expect((init.headers as Headers).get('Authorization')).toBeNull()
  })

  it('serializa body como JSON y agrega Content-Type', async () => {
    fetchMock.mockResolvedValue(jsonRes(201, { ok: true, message: 'created', data: { id: '1' } }))
    await clientFetch('/clients', { method: 'POST', body: { name: 'Acme' } })
    const [, init] = fetchMock.mock.calls[0]
    expect(init.body).toBe(JSON.stringify({ name: 'Acme' }))
    expect((init.headers as Headers).get('Content-Type')).toBe('application/json')
  })

  it('lanza ApiError con mensaje del envelope en fallo ok:false', async () => {
    fetchMock.mockResolvedValue(jsonRes(400, { ok: false, message: 'Datos inválidos' }))
    await expect(clientFetch('/clients')).rejects.toThrow('Datos inválidos')
    await expect(clientFetch('/clients')).rejects.toBeInstanceOf(ApiError)
  })

  it('lanza ApiError 401 cuando el servidor devuelve 401', async () => {
    fetchMock.mockResolvedValue(jsonRes(401, { ok: false, message: 'No autenticado' }))
    const err = await clientFetch('/me').catch((e: unknown) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect((err as ApiError).status).toBe(401)
    expect((err as ApiError).message).toBe('No autenticado')
  })

  it('lanza ApiError 401 con mensaje por defecto si no hay envelope en 401', async () => {
    fetchMock.mockResolvedValue(badJsonRes(401))
    const err = await clientFetch('/me').catch((e: unknown) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect((err as ApiError).status).toBe(401)
    expect((err as ApiError).message).toBe('No autenticado')
  })

  it('lanza ApiError "Respuesta inválida" en respuesta no-JSON para status no-401', async () => {
    fetchMock.mockResolvedValue(badJsonRes(500))
    const err = await clientFetch('/clients').catch((e: unknown) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect((err as ApiError).status).toBe(500)
    expect((err as ApiError).message).toBe('Respuesta inválida del servidor')
  })

  it('lanza ApiError de red si fetch rechaza', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
    await expect(clientFetch('/clients')).rejects.toThrow('Failed to fetch')
  })
})
