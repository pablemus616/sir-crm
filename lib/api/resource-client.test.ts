import { afterEach, describe, expect, it, vi } from 'vitest'
import { createResourceClient } from './resource-client'

interface Client {
  id: number
  name: string
}

function spyFetch(json: unknown) {
  const spy = vi.fn(async (_url: string, _init?: RequestInit) =>
    ({ status: 200, json: async () => json }) as unknown as Response,
  )
  vi.stubGlobal('fetch', spy)
  return spy
}

afterEach(() => vi.unstubAllGlobals())

describe('createResourceClient', () => {
  const clients = createResourceClient<Client>('clients')

  it('list arma la query de paginación y devuelve Paginated', async () => {
    const spy = spyFetch({ ok: true, message: '', data: { items: [], total: 0, page: 2, limit: 20 } })
    const res = await clients.list({ page: 2, limit: 20, sectorId: 5 })
    expect(spy.mock.calls[0][0]).toBe('/api/proxy/clients?page=2&limit=20&sectorId=5')
    expect(res.page).toBe(2)
  })

  it('create envía POST con body JSON', async () => {
    const spy = spyFetch({ ok: true, message: '', data: { id: 1, name: 'ACME' } })
    await clients.create({ name: 'ACME' })
    const init = spy.mock.calls[0][1] as RequestInit
    expect(init.method).toBe('POST')
    expect(init.body).toBe(JSON.stringify({ name: 'ACME' }))
  })

  it('update usa PATCH en /:id y remove usa DELETE', async () => {
    const spy = spyFetch({ ok: true, message: '', data: { id: 1, name: 'X' } })
    await clients.update(1, { name: 'X' })
    expect((spy.mock.calls[0][1] as RequestInit).method).toBe('PATCH')
    expect(spy.mock.calls[0][0]).toBe('/api/proxy/clients/1')
    await clients.remove(1)
    expect((spy.mock.calls[1][1] as RequestInit).method).toBe('DELETE')
  })

  it('action llama subruta con método dado', async () => {
    const spy = spyFetch({ ok: true, message: '', data: { id: 1, name: 'X' } })
    await clients.action('1/handle', 'PATCH', { note: 'ok' })
    expect(spy.mock.calls[0][0]).toBe('/api/proxy/clients/1/handle')
    expect((spy.mock.calls[0][1] as RequestInit).method).toBe('PATCH')
  })
})
