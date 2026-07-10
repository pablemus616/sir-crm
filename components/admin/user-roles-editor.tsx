'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Combobox } from '@/components/ui/combobox';
import { useList } from '@/lib/api/hooks';
import { useUserDetail, useAssignRole, useRemoveRole } from '@/lib/api/users';
import type { Role } from '@/lib/api/types/admin';

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
        <Combobox
          options={available.map((r) => ({ label: r.name, value: String(r.id) }))}
          value={selected}
          onChange={(v) => setSelected(v ?? '')}
          loading={roles.isLoading}
          placeholder="Agregar rol…"
          searchPlaceholder="Buscar rol…"
          emptyText="No hay roles disponibles."
          triggerClassName="w-full"
        />
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
