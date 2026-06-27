import { clientFetch } from './client'
import type { ListParams, Paginated } from './types'

export type Id = string | number
export type HttpMethod = 'POST' | 'PATCH' | 'PUT' | 'DELETE'

export interface ResourceClient<T, C = Partial<T>, U = Partial<T>> {
  base: string
  list: (params?: ListParams) => Promise<Paginated<T>>
  one: (id: Id) => Promise<T>
  create: (dto: C) => Promise<T>
  update: (id: Id, dto: U) => Promise<T>
  remove: (id: Id) => Promise<void>
  action: <R = T>(path: string, method?: HttpMethod, body?: unknown) => Promise<R>
}

export function createResourceClient<T, C = Partial<T>, U = Partial<T>>(
  base: string,
): ResourceClient<T, C, U> {
  const root = base.replace(/^\/+|\/+$/g, '')
  return {
    base: root,
    list: (params) => clientFetch<Paginated<T>>(root, { params }),
    one: (id) => clientFetch<T>(`${root}/${id}`),
    create: (dto) => clientFetch<T>(root, { method: 'POST', body: dto }),
    update: (id, dto) => clientFetch<T>(`${root}/${id}`, { method: 'PATCH', body: dto }),
    remove: (id) => clientFetch<void>(`${root}/${id}`, { method: 'DELETE' }),
    action: <R = T>(path: string, method: HttpMethod = 'PATCH', body?: unknown) =>
      clientFetch<R>(`${root}/${path.replace(/^\/+/, '')}`, {
        method,
        ...(body !== undefined ? { body } : {}),
      }),
  }
}
