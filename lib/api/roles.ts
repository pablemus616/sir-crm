'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { clientFetch } from '@/lib/api/client';
import { resourceKeys } from '@/lib/api/query-keys';
import type { Role } from '@/lib/api/types/admin';

/**
 * Prefijo de claves del recurso 'roles'. Invalidar este prefijo refresca tanto
 * la lista (conteo de permisos) como cualquier detalle por rol (useRoleDetail),
 * porque ambas claves empiezan con 'roles'.
 */
const ROLES_KEY = resourceKeys('roles').all;

/**
 * Detalle fresco de un rol (GET /roles/:id), con sus permisos serializados como
 * objetos {id,name}. Usa la misma clave que el detalle del recurso para que la
 * invalidación de ['roles'] lo refetche tras asignar/remover un permiso.
 */
export function useRoleDetail(id: number | undefined) {
  return useQuery({
    queryKey: resourceKeys('roles').detail(id ?? 'nil'),
    queryFn: () => clientFetch<Role>(`roles/${id}`),
    enabled: id !== undefined && id !== null,
  });
}

/**
 * Asigna UN permiso a un rol (POST /roles/:id/permissions con { permissionId }).
 * El backend es idempotente y devuelve el rol actualizado con sus permisos.
 */
export function useAssignPermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: number; permissionId: number }) =>
      clientFetch<Role>(`roles/${roleId}/permissions`, {
        method: 'POST',
        body: { permissionId },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ROLES_KEY });
      toast.success('Permiso asignado');
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : 'No se pudo asignar el permiso'),
  });
}

/**
 * Remueve UN permiso de un rol (DELETE /roles/:id/permissions/:permId, con el
 * permiso en la ruta). Devuelve el rol actualizado con sus permisos.
 */
export function useRemovePermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: number; permissionId: number }) =>
      clientFetch<Role>(`roles/${roleId}/permissions/${permissionId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ROLES_KEY });
      toast.success('Permiso removido');
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : 'No se pudo remover el permiso'),
  });
}
