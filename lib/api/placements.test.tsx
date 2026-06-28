import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const clientFetchMock = vi.fn();
vi.mock('@/lib/api/client', () => ({
  clientFetch: (...a: unknown[]) => clientFetchMock(...a),
}));

import {
  usePlacements,
  usePlacement,
  useCreatePlacement,
  type PlacementFilters,
} from './placements';

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

describe('usePlacements', () => {
  beforeEach(() => clientFetchMock.mockReset());

  it('arma los params omitiendo undefined y cadenas vacías', async () => {
    clientFetchMock.mockResolvedValue({ items: [], total: 0, page: 1, limit: 20 });
    // status como '' (cast) ejercita la rama v !== '' adicional al undefined.
    const filters = {
      clientId: 4,
      recruiterId: undefined,
      status: '',
      from: '2026-01-01',
      to: '',
    } as unknown as PlacementFilters;
    const { result } = renderHook(() => usePlacements(filters), {
      wrapper: wrapper(freshClient()),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const { params } = clientFetchMock.mock.calls[0][1] as {
      params: Record<string, unknown>;
    };
    expect(params).toEqual({ clientId: 4, from: '2026-01-01' });
    expect(params).not.toHaveProperty('recruiterId');
    expect(params).not.toHaveProperty('status');
    expect(params).not.toHaveProperty('to');
  });
});

describe('usePlacement', () => {
  beforeEach(() => clientFetchMock.mockReset());

  it('hace GET a /placements/:id cuando hay id', async () => {
    clientFetchMock.mockResolvedValue({ id: 3, status: 'active' });
    const { result } = renderHook(() => usePlacement(3), {
      wrapper: wrapper(freshClient()),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(clientFetchMock).toHaveBeenCalledWith('placements/3');
  });

  it('queda deshabilitado (no fetch) cuando id es undefined', () => {
    const { result } = renderHook(() => usePlacement(undefined), {
      wrapper: wrapper(freshClient()),
    });
    expect(result.current.fetchStatus).toBe('idle');
    expect(clientFetchMock).not.toHaveBeenCalled();
  });
});

describe('useCreatePlacement', () => {
  beforeEach(() => clientFetchMock.mockReset());

  it('hace POST a placements con body objeto SIN candidateId/opportunityId/placedByEmployeeId', async () => {
    clientFetchMock.mockResolvedValue({ id: 1, applicationId: 7, status: 'active' });
    const { result } = renderHook(() => useCreatePlacement(), {
      wrapper: wrapper(freshClient()),
    });
    result.current.mutate({ applicationId: 7, placementDate: '2026-06-28' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const [path, init] = clientFetchMock.mock.calls[0] as [
      string,
      { method: string; body: Record<string, unknown> },
    ];
    expect(path).toBe('placements');
    expect(init.method).toBe('POST');
    // El body es un OBJETO (no pre-stringificado).
    expect(init.body).toEqual({ applicationId: 7, placementDate: '2026-06-28' });
    expect(init.body).not.toHaveProperty('candidateId');
    expect(init.body).not.toHaveProperty('opportunityId');
    expect(init.body).not.toHaveProperty('placedByEmployeeId');
  });

  it('en éxito invalida ["placements"], ["opportunities"] Y ["applications"]', async () => {
    clientFetchMock.mockResolvedValue({ id: 1, applicationId: 7, status: 'active' });
    const qc = freshClient();
    const spy = vi.spyOn(qc, 'invalidateQueries');
    const { result } = renderHook(() => useCreatePlacement(), {
      wrapper: wrapper(qc),
    });
    result.current.mutate({ applicationId: 7, placementDate: '2026-06-28' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const keys = spy.mock.calls.map(
      (c) => (c[0] as { queryKey: unknown[] }).queryKey,
    );
    expect(keys).toContainEqual(['placements']);
    expect(keys).toContainEqual(['opportunities']);
    expect(keys).toContainEqual(['applications']);
  });

  it('propaga el mensaje de error del backend al error de la mutación', async () => {
    clientFetchMock.mockRejectedValueOnce(new Error('Application 7 not found'));
    const { result } = renderHook(() => useCreatePlacement(), {
      wrapper: wrapper(freshClient()),
    });
    result.current.mutate({ applicationId: 7, placementDate: '2026-06-28' });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toMatch(/not found/);
  });
});
