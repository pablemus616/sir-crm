import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const clientFetchMock = vi.fn();
vi.mock('@/lib/api/client', () => ({
  clientFetch: (...a: unknown[]) => clientFetchMock(...a),
}));

import { useRoleDetail, useAssignPermission, useRemovePermission } from './roles';
import { RolePermissionsEditor } from '@/components/admin/role-permissions-editor';

function wrapper(qc: QueryClient) {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

function freshClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

describe('useRoleDetail', () => {
  beforeEach(() => clientFetchMock.mockReset());

  it('hace GET a roles/:id cuando hay id', async () => {
    clientFetchMock.mockResolvedValue({ id: 3, name: 'reclutador', permissions: [] });
    const { result } = renderHook(() => useRoleDetail(3), {
      wrapper: wrapper(freshClient()),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(clientFetchMock).toHaveBeenCalledWith('roles/3');
  });

  it('queda deshabilitado (no fetch) cuando id es undefined', async () => {
    const { result } = renderHook(() => useRoleDetail(undefined), {
      wrapper: wrapper(freshClient()),
    });
    expect(result.current.fetchStatus).toBe('idle');
    expect(clientFetchMock).not.toHaveBeenCalled();
  });
});

describe('useAssignPermission', () => {
  beforeEach(() => clientFetchMock.mockReset());

  it('hace POST a roles/:id/permissions con body { permissionId } (objeto, no array)', async () => {
    clientFetchMock.mockResolvedValue({
      id: 3,
      name: 'reclutador',
      permissions: [{ id: 7, name: 'ver' }],
    });
    const { result } = renderHook(() => useAssignPermission(), {
      wrapper: wrapper(freshClient()),
    });
    result.current.mutate({ roleId: 3, permissionId: 7 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(clientFetchMock).toHaveBeenCalledWith('roles/3/permissions', {
      method: 'POST',
      body: { permissionId: 7 },
    });
    // body es un objeto plano, no un array ni una cadena pre-serializada.
    const call = clientFetchMock.mock.calls[0][1] as { body: unknown };
    expect(Array.isArray(call.body)).toBe(false);
    expect(typeof call.body).toBe('object');
  });

  it('invalida el prefijo ["roles"] al asignar', async () => {
    clientFetchMock.mockResolvedValue({ id: 3, name: 'reclutador', permissions: [] });
    const qc = freshClient();
    const spy = vi.spyOn(qc, 'invalidateQueries');
    const { result } = renderHook(() => useAssignPermission(), { wrapper: wrapper(qc) });
    result.current.mutate({ roleId: 3, permissionId: 7 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledWith({ queryKey: ['roles'] });
  });
});

describe('useRemovePermission', () => {
  beforeEach(() => clientFetchMock.mockReset());

  it('hace DELETE a roles/:id/permissions/:permId (permiso en la ruta)', async () => {
    clientFetchMock.mockResolvedValue({ id: 3, name: 'reclutador', permissions: [] });
    const { result } = renderHook(() => useRemovePermission(), {
      wrapper: wrapper(freshClient()),
    });
    result.current.mutate({ roleId: 3, permissionId: 7 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(clientFetchMock).toHaveBeenCalledWith('roles/3/permissions/7', {
      method: 'DELETE',
    });
  });

  it('invalida el prefijo ["roles"] al remover', async () => {
    clientFetchMock.mockResolvedValue({ id: 3, name: 'reclutador', permissions: [] });
    const qc = freshClient();
    const spy = vi.spyOn(qc, 'invalidateQueries');
    const { result } = renderHook(() => useRemovePermission(), { wrapper: wrapper(qc) });
    result.current.mutate({ roleId: 3, permissionId: 7 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledWith({ queryKey: ['roles'] });
  });
});

/* ------------------------------------------------------------------ */
/* RolePermissionsEditor — hooks reales contra clientFetch enrutado    */
/* ------------------------------------------------------------------ */

/** Enruta el clientFetch mockeado por ruta: GET roles/:id, GET permissions, DELETE. */
function routeClientFetch(role: {
  id: number;
  name: string;
  permissions: { id: number; name: string }[];
}) {
  clientFetchMock.mockImplementation((path: string) => {
    if (path === `roles/${role.id}`) return Promise.resolve(role);
    if (path === 'permissions')
      return Promise.resolve({
        items: [
          { id: 7, name: 'ver' },
          { id: 8, name: 'editar' },
        ],
        total: 2,
        page: 1,
        limit: 200,
      });
    // Sub-rutas de asignar/remover devuelven el rol actualizado.
    return Promise.resolve(role);
  });
}

describe('RolePermissionsEditor', () => {
  beforeEach(() => clientFetchMock.mockReset());

  it('lista los permisos asignados como chips y permite removerlos', async () => {
    routeClientFetch({ id: 3, name: 'reclutador', permissions: [{ id: 7, name: 'ver' }] });

    render(
      <QueryClientProvider client={freshClient()}>
        <RolePermissionsEditor roleId={3} />
      </QueryClientProvider>,
    );

    // El chip del permiso asignado aparece tras resolver el detalle.
    await waitFor(() => expect(screen.getByText('ver')).toBeInTheDocument());

    const removeBtn = screen.getByRole('button', { name: 'Remover ver' });
    await userEvent.click(removeBtn);

    await waitFor(() =>
      expect(clientFetchMock).toHaveBeenCalledWith('roles/3/permissions/7', {
        method: 'DELETE',
      }),
    );
  });

  it('muestra el vacío cuando no hay permisos y el botón Agregar inicia deshabilitado', async () => {
    routeClientFetch({ id: 3, name: 'reclutador', permissions: [] });

    render(
      <QueryClientProvider client={freshClient()}>
        <RolePermissionsEditor roleId={3} />
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(screen.getByText('Sin permisos asignados.')).toBeInTheDocument(),
    );
    expect(screen.getByRole('button', { name: 'Agregar' })).toBeDisabled();
  });
});
