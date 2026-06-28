import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const clientFetchMock = vi.fn();
vi.mock('@/lib/api/client', () => ({
  clientFetch: (...a: unknown[]) => clientFetchMock(...a),
}));

import {
  useCreateUser,
  useUpdateUser,
  useAssignRole,
  useRemoveRole,
} from './users';
import { UserFormDialog } from '@/components/admin/user-form-dialog';

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

describe('useCreateUser', () => {
  beforeEach(() => clientFetchMock.mockReset());

  it('hace POST a users con body { username, password, employeeId } (objeto)', async () => {
    clientFetchMock.mockResolvedValue({ id: 1, username: 'ana', employeeId: 2, roles: [] });
    const { result } = renderHook(() => useCreateUser(), {
      wrapper: wrapper(freshClient()),
    });
    result.current.mutate({ username: 'ana', password: 's3creta', employeeId: 2 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(clientFetchMock).toHaveBeenCalledWith('users', {
      method: 'POST',
      body: { username: 'ana', password: 's3creta', employeeId: 2 },
    });
    const call = clientFetchMock.mock.calls[0][1] as { body: unknown };
    expect(Array.isArray(call.body)).toBe(false);
    expect(typeof call.body).toBe('object');
  });

  it('invalida el prefijo ["users"] al crear', async () => {
    clientFetchMock.mockResolvedValue({ id: 1, username: 'ana', employeeId: 2, roles: [] });
    const qc = freshClient();
    const spy = vi.spyOn(qc, 'invalidateQueries');
    const { result } = renderHook(() => useCreateUser(), { wrapper: wrapper(qc) });
    result.current.mutate({ username: 'ana', password: 's3creta', employeeId: 2 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledWith({ queryKey: ['users'] });
  });
});

describe('useUpdateUser', () => {
  beforeEach(() => clientFetchMock.mockReset());

  it('hace PATCH a users/:id y OMITE password cuando viene en blanco (undefined)', async () => {
    clientFetchMock.mockResolvedValue({ id: 5, username: 'nuevo', employeeId: 3, roles: [] });
    const { result } = renderHook(() => useUpdateUser(), {
      wrapper: wrapper(freshClient()),
    });
    result.current.mutate({
      id: 5,
      username: 'nuevo',
      password: undefined,
      employeeId: 3,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(clientFetchMock).toHaveBeenCalledWith('users/5', {
      method: 'PATCH',
      body: { username: 'nuevo', employeeId: 3 },
    });
    const call = clientFetchMock.mock.calls[0][1] as { body: Record<string, unknown> };
    expect('password' in call.body).toBe(false);
  });

  it('incluye password cuando sí se provee', async () => {
    clientFetchMock.mockResolvedValue({ id: 5, username: 'nuevo', employeeId: 3, roles: [] });
    const { result } = renderHook(() => useUpdateUser(), {
      wrapper: wrapper(freshClient()),
    });
    result.current.mutate({ id: 5, password: 'otra' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(clientFetchMock).toHaveBeenCalledWith('users/5', {
      method: 'PATCH',
      body: { password: 'otra' },
    });
  });
});

describe('useAssignRole', () => {
  beforeEach(() => clientFetchMock.mockReset());

  it('hace POST a users/:id/roles con body { roleId } (objeto, no array)', async () => {
    clientFetchMock.mockResolvedValue({
      id: 5,
      username: 'ana',
      employeeId: 2,
      roles: [{ id: 7, name: 'admin' }],
    });
    const { result } = renderHook(() => useAssignRole(), {
      wrapper: wrapper(freshClient()),
    });
    result.current.mutate({ userId: 5, roleId: 7 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(clientFetchMock).toHaveBeenCalledWith('users/5/roles', {
      method: 'POST',
      body: { roleId: 7 },
    });
    const call = clientFetchMock.mock.calls[0][1] as { body: unknown };
    expect(Array.isArray(call.body)).toBe(false);
    expect(typeof call.body).toBe('object');
  });

  it('invalida el prefijo ["users"] al asignar', async () => {
    clientFetchMock.mockResolvedValue({ id: 5, username: 'ana', employeeId: 2, roles: [] });
    const qc = freshClient();
    const spy = vi.spyOn(qc, 'invalidateQueries');
    const { result } = renderHook(() => useAssignRole(), { wrapper: wrapper(qc) });
    result.current.mutate({ userId: 5, roleId: 7 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledWith({ queryKey: ['users'] });
  });
});

describe('useRemoveRole', () => {
  beforeEach(() => clientFetchMock.mockReset());

  it('hace DELETE a users/:id/roles/:roleId (roleId en la ruta)', async () => {
    clientFetchMock.mockResolvedValue({ id: 5, username: 'ana', employeeId: 2, roles: [] });
    const { result } = renderHook(() => useRemoveRole(), {
      wrapper: wrapper(freshClient()),
    });
    result.current.mutate({ userId: 5, roleId: 7 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(clientFetchMock).toHaveBeenCalledWith('users/5/roles/7', {
      method: 'DELETE',
    });
  });

  it('invalida el prefijo ["users"] al remover', async () => {
    clientFetchMock.mockResolvedValue({ id: 5, username: 'ana', employeeId: 2, roles: [] });
    const qc = freshClient();
    const spy = vi.spyOn(qc, 'invalidateQueries');
    const { result } = renderHook(() => useRemoveRole(), { wrapper: wrapper(qc) });
    result.current.mutate({ userId: 5, roleId: 7 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledWith({ queryKey: ['users'] });
  });
});

/* ------------------------------------------------------------------ */
/* UserFormDialog — modo edición: la contraseña es opcional            */
/* ------------------------------------------------------------------ */

describe('UserFormDialog (edición)', () => {
  beforeEach(() => clientFetchMock.mockReset());

  it('muestra ayuda de contraseña opcional y al guardar sin tocarla OMITE password', async () => {
    clientFetchMock.mockImplementation((path: string) => {
      if (path === 'employees')
        return Promise.resolve({
          items: [{ id: 3, firstName: 'Ana', lastName: 'López' }],
          total: 1,
          page: 1,
          limit: 500,
        });
      // PATCH users/:id devuelve el usuario actualizado.
      return Promise.resolve({ id: 5, username: 'ana', employeeId: 3, roles: [] });
    });

    render(
      <QueryClientProvider client={freshClient()}>
        <UserFormDialog
          open
          onOpenChange={() => {}}
          user={{ id: 5, username: 'ana', employeeId: 3, roles: [] }}
        />
      </QueryClientProvider>,
    );

    // El texto de ayuda solo aparece en modo edición.
    await waitFor(() =>
      expect(screen.getByText('Dejar en blanco para no cambiarla.')).toBeInTheDocument(),
    );

    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() =>
      expect(clientFetchMock).toHaveBeenCalledWith('users/5', expect.anything()),
    );
    const patchCall = clientFetchMock.mock.calls.find((c) => c[0] === 'users/5');
    const body = (patchCall?.[1] as { body: Record<string, unknown> }).body;
    expect('password' in body).toBe(false);
    expect(body.username).toBe('ana');
    expect(body.employeeId).toBe(3);
  });
});
