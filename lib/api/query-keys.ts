import type { ListParams } from './types'
import type { Id } from './resource-client'

export function resourceKeys(key: string) {
  const all = [key] as const
  return {
    all,
    lists: () => [...all, 'list'] as const,
    list: (params?: ListParams) => [...all, 'list', params ?? {}] as const,
    details: () => [...all, 'detail'] as const,
    detail: (id: Id) => [...all, 'detail', String(id)] as const,
  }
}

export type ResourceKeys = ReturnType<typeof resourceKeys>
