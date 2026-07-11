'use client'

import { useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useList } from '@/lib/api/hooks'
import {
  useRoleDetail,
  useAssignPermission,
  useRemovePermission,
} from '@/lib/api/roles'
import {
  usePermissionsCatalog,
  actionsForModule,
  type PermissionAction,
  type PermissionModule,
} from '@/lib/api/permissions-catalog'
import type { Role, Permission } from '@/lib/api/types/admin'

/** Orden de los grupos en el tablero (coincide con el catálogo del backend). */
const GROUP_ORDER = [
  'General',
  'Comercial',
  'Reclutamiento',
  'Catálogos',
  'Admin',
] as const

const ACTION_LABEL: Record<PermissionAction, string> = {
  read: 'Ver',
  create: 'Crear',
  update: 'Editar',
  delete: 'Eliminar',
}

function Chip({
  active,
  onClick,
  disabled,
  children,
  title,
}: {
  active: boolean
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
  title?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      title={title}
      className={cn(
        'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-input bg-background text-muted-foreground hover:bg-secondary',
      )}
    >
      {children}
    </button>
  )
}

export function PermissionsBoard() {
  const rolesQuery = useList<Role>('roles', { limit: 1000 })
  const permsQuery = useList<Permission>('permissions', { limit: 1000 })
  const catalogQuery = usePermissionsCatalog()

  const roles = useMemo(() => rolesQuery.data?.items ?? [], [rolesQuery.data])
  const [picked, setPicked] = useState<number | null>(null)
  const selectedRoleId = picked ?? roles[0]?.id ?? null

  const roleDetail = useRoleDetail(selectedRoleId ?? undefined)
  const assign = useAssignPermission()
  const remove = useRemovePermission()
  const busy = assign.isPending || remove.isPending

  /** name -> id, para traducir "module:action" al id numérico que espera la API. */
  const permIdByName = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of permsQuery.data?.items ?? []) map.set(p.name, p.id)
    return map
  }, [permsQuery.data])

  const grantedNames = useMemo(() => {
    return new Set((roleDetail.data?.permissions ?? []).map((p) => p.name))
  }, [roleDetail.data])

  const grouped = useMemo(() => {
    const modules = catalogQuery.data?.modules ?? []
    return GROUP_ORDER.map((group) => ({
      group,
      mods: modules.filter((m) => m.group === group),
    })).filter((g) => g.mods.length > 0)
  }, [catalogQuery.data])

  function grant(name: string) {
    const id = permIdByName.get(name)
    if (id == null || selectedRoleId == null || grantedNames.has(name)) return
    assign.mutate({ roleId: selectedRoleId, permissionId: id })
  }
  function revoke(name: string) {
    const id = permIdByName.get(name)
    if (id == null || selectedRoleId == null || !grantedNames.has(name)) return
    remove.mutate({ roleId: selectedRoleId, permissionId: id })
  }
  function toggle(name: string) {
    if (grantedNames.has(name)) revoke(name)
    else grant(name)
  }

  // Módulos ownable: "Ver" abarca read (todo) o read:own (propio).
  function toggleRead(m: PermissionModule) {
    const all = `${m.key}:read`
    const own = `${m.key}:read:own`
    if (grantedNames.has(all) || grantedNames.has(own)) {
      revoke(all)
      revoke(own)
    } else {
      grant(all)
    }
  }
  function setScope(m: PermissionModule, scope: 'all' | 'own') {
    const all = `${m.key}:read`
    const own = `${m.key}:read:own`
    if (scope === 'all') {
      grant(all)
      revoke(own)
    } else {
      grant(own)
      revoke(all)
    }
  }

  const loading =
    rolesQuery.isLoading || permsQuery.isLoading || catalogQuery.isLoading
  // Sin definiciones de permisos en la BD no hay id que asignar: los toggles no
  // podrían hacer nada. Lo hacemos explícito en vez de fallar en silencio.
  const noPermissionDefs =
    !loading && (permsQuery.data?.items.length ?? 0) === 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-foreground">Permisos</h1>
          <p className="text-sm text-muted-foreground">
            Asigná qué puede ver y hacer cada rol. Los cambios se guardan al
            instante.
          </p>
        </div>
        {busy && (
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            Guardando…
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 rounded-md border border-border bg-card p-8 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Cargando permisos…
        </div>
      ) : noPermissionDefs ? (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-6 text-sm text-foreground">
          <p className="font-medium">Faltan los permisos base.</p>
          <p className="mt-1 text-muted-foreground">
            La tabla de permisos está vacía, por eso los cambios no se guardan.
            Reinicia el backend (se sincronizan solos al arrancar) o corre el
            seed, y vuelve a abrir esta página.
          </p>
        </div>
      ) : roles.length === 0 ? (
        <div className="rounded-md border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          No hay roles. Creá un rol primero para asignarle permisos.
        </div>
      ) : (
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          {/* Columna de roles */}
          <div className="shrink-0 md:w-60">
            <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Roles
            </p>
            <div className="flex flex-col gap-1.5">
              {roles.map((role) => {
                const active = role.id === selectedRoleId
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setPicked(role.id)}
                    className={cn(
                      'flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors',
                      active
                        ? 'border-primary bg-primary/10 font-medium text-foreground'
                        : 'border-border bg-card text-foreground hover:bg-secondary',
                    )}
                  >
                    <span className="truncate">{role.name}</span>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 text-xs',
                        active
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {role.permissions?.length ?? 0}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Matriz de permisos del rol seleccionado */}
          <div className="min-w-0 flex-1 space-y-6">
            {roleDetail.isLoading ? (
              <div className="flex items-center gap-2 rounded-md border border-border bg-card p-8 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Cargando permisos del rol…
              </div>
            ) : (
              grouped.map(({ group, mods }) => (
                <section key={group} className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {group}
                  </p>
                  <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-card">
                    {mods.map((m) => {
                      const actions = actionsForModule(m)
                      const readAll = grantedNames.has(`${m.key}:read`)
                      const readOwn = grantedNames.has(`${m.key}:read:own`)
                      const canSee = readAll || readOwn
                      return (
                        <div
                          key={m.key}
                          className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5"
                        >
                          <span className="text-sm text-foreground">
                            {m.label}
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {actions.map((action) => {
                              if (action === 'read') {
                                return (
                                  <span
                                    key={action}
                                    className="flex items-center gap-1.5"
                                  >
                                    <Chip
                                      active={canSee}
                                      disabled={busy}
                                      onClick={() =>
                                        m.ownable
                                          ? toggleRead(m)
                                          : toggle(`${m.key}:read`)
                                      }
                                    >
                                      {ACTION_LABEL.read}
                                    </Chip>
                                    {m.ownable && canSee && (
                                      <span className="inline-flex overflow-hidden rounded-md border border-input">
                                        <button
                                          type="button"
                                          disabled={busy}
                                          onClick={() => setScope(m, 'all')}
                                          className={cn(
                                            'px-2 py-1 text-xs transition-colors disabled:opacity-50',
                                            readAll
                                              ? 'bg-secondary font-medium text-foreground'
                                              : 'bg-background text-muted-foreground hover:bg-secondary',
                                          )}
                                        >
                                          Todo
                                        </button>
                                        <button
                                          type="button"
                                          disabled={busy}
                                          onClick={() => setScope(m, 'own')}
                                          className={cn(
                                            'border-l border-input px-2 py-1 text-xs transition-colors disabled:opacity-50',
                                            readOwn
                                              ? 'bg-secondary font-medium text-foreground'
                                              : 'bg-background text-muted-foreground hover:bg-secondary',
                                          )}
                                        >
                                          Propio
                                        </button>
                                      </span>
                                    )}
                                  </span>
                                )
                              }
                              const name = `${m.key}:${action}`
                              return (
                                <Chip
                                  key={action}
                                  active={grantedNames.has(name)}
                                  disabled={busy}
                                  onClick={() => toggle(name)}
                                >
                                  {ACTION_LABEL[action]}
                                </Chip>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              ))
            )}
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Todo</span> = ve todos los registros
              del módulo · <span className="font-medium">Propio</span> = solo los
              que le pertenecen. El rol <span className="font-medium">admin</span>{' '}
              siempre tiene acceso completo.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
