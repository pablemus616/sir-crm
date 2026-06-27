import { describe, expect, it } from 'vitest'
import { labelForHref, visibleGroups } from '@/lib/auth/nav'
import { hasRole, isAdmin } from '@/lib/auth/roles'
import type { Me } from '@/lib/auth/types'

const base: Pick<Me, 'roles'> = { roles: [{ id: '1', name: 'auth' }] }
const admin: Pick<Me, 'roles'> = { roles: [{ id: '2', name: 'ADMIN' }] }

describe('roles', () => {
  it('hasRole es case-insensitive', () => {
    expect(hasRole(admin, 'admin')).toBe(true)
    expect(hasRole(base, 'admin')).toBe(false)
  })
  it('isAdmin detecta el rol admin', () => {
    expect(isAdmin(admin)).toBe(true)
    expect(isAdmin(base)).toBe(false)
  })
})

describe('visibleGroups', () => {
  it('oculta Catálogos y Admin a no-admin', () => {
    const labels = visibleGroups(false).map((g) => g.label)
    expect(labels).toContain('Comercial')
    expect(labels).not.toContain('Admin')
    expect(labels).not.toContain('Catálogos')
  })
  it('muestra todos los grupos a admin', () => {
    const labels = visibleGroups(true).map((g) => g.label)
    expect(labels).toContain('Admin')
    expect(labels).toContain('Catálogos')
  })
})

describe('labelForHref', () => {
  it('mapea la ruta al label de nav', () => {
    expect(labelForHref('/opportunities')).toBe('Oportunidades')
    expect(labelForHref('/clients/123')).toBe('Clientes')
  })
})
