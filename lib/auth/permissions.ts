import type { Me } from './types'
import { isAdmin } from './roles'

export type PermAction = 'read' | 'create' | 'update' | 'delete'
export type DataScope = 'own' | 'all'

type MeLike = Pick<Me, 'roles' | 'permissions'>

/**
 * Whether the user may perform `action` on `module`. Mirrors the backend
 * PermissionsGuard: admin bypasses; read is granted by either `module:read`
 * (all) or `module:read:own` (own).
 */
export function can(me: MeLike, module: string, action: PermAction): boolean {
  if (isAdmin(me)) return true
  const perms = me.permissions ?? []
  if (action === 'read') {
    return perms.includes(`${module}:read`) || perms.includes(`${module}:read:own`)
  }
  return perms.includes(`${module}:${action}`)
}

export function canRead(me: MeLike, module: string): boolean {
  return can(me, module, 'read')
}

/** Read scope for a module: `all` unless the role only holds the `:own` grant. */
export function scopeFor(me: MeLike, module: string): DataScope {
  if (isAdmin(me)) return 'all'
  const perms = me.permissions ?? []
  if (perms.includes(`${module}:read`)) return 'all'
  if (perms.includes(`${module}:read:own`)) return 'own'
  return 'all'
}

/** True if the user can read at least one of the given modules. */
export function canReadAny(me: MeLike, modules: string[]): boolean {
  return modules.some((m) => canRead(me, m))
}
