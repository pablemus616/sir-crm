'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useList } from '@/lib/api/hooks';
import { useUserDetail, useAssignRole, useRemoveRole } from '@/lib/api/users';
import type { Role } from '@/lib/api/types/admin';

/** Centinela para el item placeholder (cargando / vacío): base-ui Select exige
 *  un `value` en cada Item; este nunca se selecciona porque va deshabilitado. */
const PLACEHOLDER = '__placeholder__';

/**
 * Editor M:N de roles de un usuario. Trae el usuario fresco (useUserDetail) para
 * reflejar asignaciones y bajas al instante; el backend expone una sub-ruta por
 * ítem, así que cada clic asigna o remueve un solo rol.
 */
export function UserRolesEditor({ userId }: { userId: number }) {
  const { data: user, isLoading, isError } = useUserDetail(userId);
  const roles = useList<Role>('roles', { limit: 200 });
  const assign = useAssignRole();
  const remove = useRemoveRole();
  const [selected, setSelected] = useState<string>('');

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }
  if (isError || !user) {
    return <p className="text-sm text-destructive">No se pudieron cargar los roles.</p>;
  }

  const assigned = user.roles ?? [];
  const assignedIds = new Set(assigned.map((r) => r.id));
  const available = (roles.data?.items ?? []).filter((r) => !assignedIds.has(r.id));

  const roleItems: Record<string, string> = {};
  for (const r of available) roleItems[String(r.id)] = r.name;

  const handleAssign = () => {
    if (!selected) return;
    assign.mutate(
      { userId, roleId: Number(selected) },
      { onSuccess: () => setSelected('') },
    );
  };

  return (
    <div className="space-y-3">
      {assigned.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin roles asignados.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {assigned.map((r) => (
            <li key={r.id}>
              <Badge variant="secondary" className="gap-1 pr-1">
                {r.name}
                <button
                  type="button"
                  aria-label={`Quitar rol ${r.name}`}
                  disabled={remove.isPending}
                  onClick={() => remove.mutate({ userId, roleId: r.id })}
                  className="ml-0.5 inline-flex items-center justify-center rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2">
        <Select
          items={roleItems}
          value={selected}
          onValueChange={(v) => setSelected(v ?? '')}
        >
          <SelectTrigger className="w-full" aria-label="Agregar rol">
            <SelectValue placeholder="Agregar rol…" />
          </SelectTrigger>
          <SelectContent>
            {roles.isLoading ? (
              <SelectItem value={PLACEHOLDER} disabled>
                Cargando…
              </SelectItem>
            ) : available.length === 0 ? (
              <SelectItem value={PLACEHOLDER} disabled>
                No hay roles disponibles
              </SelectItem>
            ) : (
              available.map((r) => (
                <SelectItem key={r.id} value={String(r.id)}>
                  {r.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        <Button
          type="button"
          onClick={handleAssign}
          disabled={!selected || assign.isPending}
        >
          Agregar
        </Button>
      </div>
    </div>
  );
}
