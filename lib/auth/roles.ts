import type { Me } from './types'

export function hasRole(me: Pick<Me, 'roles'>, role: string): boolean {
  return me.roles.some((r) => r.name.toLowerCase() === role.toLowerCase())
}

export function isAdmin(me: Pick<Me, 'roles'>): boolean {
  return hasRole(me, 'admin')
}
