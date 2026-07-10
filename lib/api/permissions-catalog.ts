'use client'

import { useQuery } from '@tanstack/react-query'
import { clientFetch } from '@/lib/api/client'

export type PermissionAction = 'read' | 'create' | 'update' | 'delete'

export interface PermissionModule {
  key: string
  label: string
  group: 'General' | 'Comercial' | 'Reclutamiento' | 'Catálogos' | 'Admin'
  ownable?: boolean
  actions?: PermissionAction[]
}

export interface PermissionCatalog {
  modules: PermissionModule[]
  actions: PermissionAction[]
}

/** Module/action taxonomy for the permissions board (GET /permissions/catalog). */
export function usePermissionsCatalog() {
  return useQuery({
    queryKey: ['permissions', 'catalog'],
    queryFn: () => clientFetch<PermissionCatalog>('permissions/catalog'),
    staleTime: 30 * 60 * 1000,
  })
}

export function actionsForModule(m: PermissionModule): PermissionAction[] {
  return m.actions ?? ['read', 'create', 'update', 'delete']
}
