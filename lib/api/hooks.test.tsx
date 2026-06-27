import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { createQueryWrapper } from '@/lib/test/query-wrapper'
import { createResourceHooks } from './hooks'
import type { ResourceClient, Id } from './resource-client'

interface Sector {
  id: number
  name: string
}

function fakeClient(): ResourceClient<Sector> {
  return {
    base: 'sectors',
    list: vi.fn(async () => ({ items: [{ id: 1, name: 'A' }], total: 1, page: 1, limit: 20 })),
    one: vi.fn(async () => ({ id: 1, name: 'A' })),
    create: vi.fn(async (dto) => ({ ...(dto as Sector), id: 2 })),
    update: vi.fn(async (id, dto) => ({ ...(dto as Sector), id: Number(id) })),
    remove: vi.fn(async () => undefined),
    action: vi.fn(async () => ({ id: 1, name: 'A' })) as ResourceClient<Sector>['action'],
  }
}

describe('createResourceHooks', () => {
  let client: ResourceClient<Sector>
  beforeEach(() => {
    client = fakeClient()
  })

  it('useList devuelve Paginated', async () => {
    const hooks = createResourceHooks<Sector>('sectors', client)
    const { wrapper } = createQueryWrapper()
    const { result } = renderHook(() => hooks.useList({ page: 1, limit: 20 }), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.items).toHaveLength(1)
    expect(client.list).toHaveBeenCalledWith({ page: 1, limit: 20 })
  })

  it('useCreate invalida las listas tras éxito', async () => {
    const hooks = createResourceHooks<Sector>('sectors', client)
    const { wrapper, client: qc } = createQueryWrapper()
    const spy = vi.spyOn(qc, 'invalidateQueries')
    const { result } = renderHook(() => hooks.useCreate(), { wrapper })
    await act(async () => {
      await result.current.mutateAsync({ name: 'Nuevo' } as Partial<Sector>)
    })
    expect(client.create).toHaveBeenCalledWith({ name: 'Nuevo' })
    expect(spy).toHaveBeenCalledWith({ queryKey: hooks.keys.lists() })
  })

  it('useRemove invalida listas y detalle', async () => {
    const hooks = createResourceHooks<Sector>('sectors', client)
    const { wrapper, client: qc } = createQueryWrapper()
    const spy = vi.spyOn(qc, 'invalidateQueries')
    const { result } = renderHook(() => hooks.useRemove(), { wrapper })
    await act(async () => {
      await result.current.mutateAsync(1)
    })
    expect(spy).toHaveBeenCalledWith({ queryKey: hooks.keys.all })
  })

  it('useOne devuelve el recurso por id y usa la clave de detalle', async () => {
    const hooks = createResourceHooks<Sector>('sectors', client)
    const { wrapper } = createQueryWrapper()
    const { result } = renderHook(() => hooks.useOne(1), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ id: 1, name: 'A' })
    expect(client.one).toHaveBeenCalledWith(1)
    expect(result.current.dataUpdatedAt).toBeGreaterThan(0) // confirma que vino de la query
  })

  it('useUpdate invalida listas Y detalle tras éxito (doble invalidación)', async () => {
    const hooks = createResourceHooks<Sector>('sectors', client)
    const { wrapper, client: qc } = createQueryWrapper()
    const spy = vi.spyOn(qc, 'invalidateQueries')
    const { result } = renderHook(() => hooks.useUpdate(), { wrapper })
    await act(async () => {
      await result.current.mutateAsync({ id: 42, dto: { name: 'Updated' } as Partial<Sector> })
    })
    expect(client.update).toHaveBeenCalledWith(42, { name: 'Updated' })
    expect(spy).toHaveBeenCalledWith({ queryKey: hooks.keys.lists() })
    expect(spy).toHaveBeenCalledWith({ queryKey: hooks.keys.detail(42) })
    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('useAction ejecuta la subruta e invalida', async () => {
    const hooks = createResourceHooks<Sector>('sectors', client)
    const { wrapper, client: qc } = createQueryWrapper()
    const spy = vi.spyOn(qc, 'invalidateQueries')
    const { result } = renderHook(
      () => hooks.useAction<Sector>({ buildPath: (id: Id) => `${id}/win`, method: 'PATCH' }),
      { wrapper },
    )
    await act(async () => {
      await result.current.mutateAsync({ id: 1, body: { amount: 10 } })
    })
    expect(client.action).toHaveBeenCalledWith('1/win', 'PATCH', { amount: 10 })
    expect(spy).toHaveBeenCalledWith({ queryKey: hooks.keys.all })
  })
})
