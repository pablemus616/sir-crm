import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const clientFetchMock = vi.fn();
vi.mock('@/lib/api/client', () => ({
  clientFetch: (...a: unknown[]) => clientFetchMock(...a),
}));

import {
  useApplications,
  useApplication,
  useCreateApplication,
  useChangeApplicationStage,
  type ApplicationFilters,
} from './applications';

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

describe('useApplications', () => {
  beforeEach(() => clientFetchMock.mockReset());

  it('arma los params omitiendo undefined y cadenas vacías', async () => {
    clientFetchMock.mockResolvedValue({ items: [], total: 0, page: 1, limit: 20 });
    // stage como '' (cast) ejercita la rama v !== '' que clientFetch no cubre.
    const filters = {
      opportunityId: 7,
      candidateId: undefined,
      stage: '',
    } as unknown as ApplicationFilters;
    const { result } = renderHook(() => useApplications(filters), {
      wrapper: wrapper(freshClient()),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const { params } = clientFetchMock.mock.calls[0][1] as {
      params: Record<string, unknown>;
    };
    // Aserción fuerte: las claves vacías NO están presentes (toEqual ignora undefined).
    expect(params).toEqual({ opportunityId: 7 });
    expect(params).not.toHaveProperty('candidateId');
    expect(params).not.toHaveProperty('stage');
  });
});

describe('useApplication', () => {
  beforeEach(() => clientFetchMock.mockReset());

  it('hace GET a /applications/:id cuando hay id', async () => {
    clientFetchMock.mockResolvedValue({ id: 12, stage: 'applied' });
    const { result } = renderHook(() => useApplication(12), {
      wrapper: wrapper(freshClient()),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(clientFetchMock).toHaveBeenCalledWith('applications/12');
  });

  it('queda deshabilitado (no fetch) cuando id es undefined', async () => {
    const { result } = renderHook(() => useApplication(undefined), {
      wrapper: wrapper(freshClient()),
    });
    expect(result.current.fetchStatus).toBe('idle');
    expect(clientFetchMock).not.toHaveBeenCalled();
  });
});

describe('useCreateApplication', () => {
  beforeEach(() => clientFetchMock.mockReset());

  it('propaga el mensaje de conflicto (409) del backend al error', async () => {
    clientFetchMock.mockRejectedValueOnce(
      new Error('Application for candidate 1 and opportunity 2 already exists'),
    );
    const { result } = renderHook(() => useCreateApplication(), {
      wrapper: wrapper(freshClient()),
    });
    result.current.mutate({ candidateId: 1, opportunityId: 2 });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toMatch(/already exists/);
  });

  it('hace POST con body objeto (sin pre-stringify)', async () => {
    clientFetchMock.mockResolvedValue({ id: 9, candidateId: 1, opportunityId: 2 });
    const { result } = renderHook(() => useCreateApplication(), {
      wrapper: wrapper(freshClient()),
    });
    result.current.mutate({ candidateId: 1, opportunityId: 2 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(clientFetchMock).toHaveBeenCalledWith('applications', {
      method: 'POST',
      body: { candidateId: 1, opportunityId: 2 },
    });
  });
});

describe('useChangeApplicationStage', () => {
  beforeEach(() => clientFetchMock.mockReset());

  it('hace PATCH a /applications/:id/stage con { stage }', async () => {
    clientFetchMock.mockResolvedValue({ id: 5, stage: 'screening' });
    const { result } = renderHook(() => useChangeApplicationStage(), {
      wrapper: wrapper(freshClient()),
    });
    result.current.mutate({ id: 5, stage: 'screening' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(clientFetchMock).toHaveBeenCalledWith('applications/5/stage', {
      method: 'PATCH',
      body: { stage: 'screening' },
    });
  });
});
