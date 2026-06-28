'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { clientFetch } from '@/lib/api/client';
import { resourceKeys } from '@/lib/api/query-keys';
import type { Paginated } from '@/lib/api/types';
import type { User } from '@/lib/api/types/admin';
import type { CreateUserInput, UpdateUserInput } from '@/lib/schemas/admin';

/**
 * Prefijo de claves del recurso 'users'. Invalidar este prefijo refresca tanto
 * la lista (useUsers) como cualquier detalle por usuario (useUserDetail),
 * porque ambas claves empiezan con 'users'.
 */
const USERS_KEY = resourceKeys('users').all;

/**
 * Lista paginada de usuarios (GET /users). Cada item trae { id, username,
 * employeeId, roles[] } — sin password y sin el objeto employee. El nombre del
 * empleado se resuelve en cliente uniendo contra useList<Employee>.
 */
export function useUsers() {
  return useQuery({
    queryKey: resourceKeys('users').list({ limit: 100 }),
    queryFn: () => clientFetch<Paginated<User>>('users', { params: { limit: 100 } }),
    placeholderData: (prev) => prev,
  });
}

/**
 * Detalle fresco de un usuario (GET /users/:id), con sus roles serializados como
 * objetos {id,name}. Comparte el prefijo ['users'] para que la invalidación lo
 * refetche tras asignar/remover un rol.
 */
export function useUserDetail(id: number | undefined) {
  return useQuery({
    queryKey: resourceKeys('users').detail(id ?? 'nil'),
    queryFn: () => clientFetch<User>(`users/${id}`),
    enabled: id !== undefined && id !== null,
  });
}

/**
 * Crea un usuario (POST /users con { username, password, employeeId }). El
 * backend impone unicidad de username y responde 409 ('Username already exists');
 * clientFetch lo lanza como ApiError(message), que se reenvía al toast.
 */
export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateUserInput) =>
      clientFetch<User>('users', { method: 'POST', body: input }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY });
      toast.success('Usuario creado');
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : 'No se pudo crear el usuario'),
  });
}

/**
 * Edita un usuario (PATCH /users/:id). Omite las claves undefined del body —
 * en especial `password` cuando se deja en blanco, para no re-hashearla sin
 * querer. El backend valida unicidad de username (409).
 */
export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: number } & UpdateUserInput) => {
      const body: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(input)) {
        if (v !== undefined) body[k] = v;
      }
      return clientFetch<User>(`users/${id}`, { method: 'PATCH', body });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY });
      toast.success('Usuario actualizado');
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : 'No se pudo actualizar el usuario'),
  });
}

/** Elimina un usuario (DELETE /users/:id). */
export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      clientFetch<void>(`users/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY });
      toast.success('Usuario eliminado');
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : 'No se pudo eliminar el usuario'),
  });
}

/**
 * Asigna UN rol a un usuario (POST /users/:id/roles con { roleId }). El backend
 * devuelve el usuario actualizado con sus roles.
 */
export function useAssignRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: number; roleId: number }) =>
      clientFetch<User>(`users/${userId}/roles`, {
        method: 'POST',
        body: { roleId },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY });
      toast.success('Rol asignado');
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : 'No se pudo asignar el rol'),
  });
}

/**
 * Remueve UN rol de un usuario (DELETE /users/:id/roles/:roleId, con el rol en
 * la ruta). Devuelve el usuario actualizado con sus roles.
 */
export function useRemoveRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: number; roleId: number }) =>
      clientFetch<User>(`users/${userId}/roles/${roleId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY });
      toast.success('Rol removido');
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : 'No se pudo remover el rol'),
  });
}
