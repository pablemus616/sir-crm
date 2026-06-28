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
import {
  useRoleDetail,
  useAssignPermission,
  useRemovePermission,
} from '@/lib/api/roles';
import type { Permission } from '@/lib/api/types/admin';

/**
 * Editor M:N de permisos de un rol, renderizado dentro del detailField del
 * recurso roles. Trae el rol fresco (useRoleDetail) para reflejar asignaciones
 * y bajas al instante; el backend expone una sub-ruta por ítem, así que cada
 * clic asigna o remueve un solo permiso.
 */
export function RolePermissionsEditor({ roleId }: { roleId: number }) {
  const { data: role, isLoading, isError } = useRoleDetail(roleId);
  const permissions = useList<Permission>('permissions', { limit: 200 });
  const assign = useAssignPermission();
  const remove = useRemovePermission();
  const [selected, setSelected] = useState<string>('');

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }
  if (isError || !role) {
    return <p className="text-sm text-destructive">No se pudieron cargar los permisos.</p>;
  }

  const assigned = role.permissions ?? [];
  const assignedIds = new Set(assigned.map((p) => p.id));
  const available = (permissions.data?.items ?? []).filter((p) => !assignedIds.has(p.id));

  const permissionItems: Record<string, string> = {};
  for (const p of available) permissionItems[String(p.id)] = p.name;

  const handleAssign = () => {
    if (!selected) return;
    assign.mutate(
      { roleId, permissionId: Number(selected) },
      { onSuccess: () => setSelected('') },
    );
  };

  return (
    <div className="space-y-3">
      {assigned.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin permisos asignados.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {assigned.map((p) => (
            <li key={p.id}>
              <Badge variant="secondary" className="gap-1 pr-1">
                {p.name}
                <button
                  type="button"
                  aria-label={`Remover ${p.name}`}
                  disabled={remove.isPending}
                  onClick={() => remove.mutate({ roleId, permissionId: p.id })}
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
          items={permissionItems}
          value={selected}
          onValueChange={(v) => setSelected(v ?? '')}
        >
          <SelectTrigger className="w-full" aria-label="Agregar permiso">
            <SelectValue placeholder="Agregar permiso…" />
          </SelectTrigger>
          <SelectContent>
            {available.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                {p.name}
              </SelectItem>
            ))}
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
