import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const clientFetchMock = vi.fn();
vi.mock('@/lib/api/client', () => ({
  clientFetch: (...a: unknown[]) => clientFetchMock(...a),
}));

import { useHandleRequest, useContactRequests } from './contact-requests';

function wrapper(qc: QueryClient) {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe('useHandleRequest', () => {
  let qc: QueryClient;

  beforeEach(() => {
    clientFetchMock.mockReset();
    qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  });

  it('llama PATCH contact-requests/:id/handle con resultingClientId', async () => {
    clientFetchMock.mockResolvedValue({ id: 5, wasHandled: true });

    const { result } = renderHook(() => useHandleRequest(), { wrapper: wrapper(qc) });
    result.current.mutate({ id: 5, resultingClientId: 9 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(clientFetchMock).toHaveBeenCalledWith(
      'contact-requests/5/handle',
      expect.objectContaining({ method: 'PATCH', body: { resultingClientId: 9 } }),
    );
  });

  it('llama PATCH sin resultingClientId cuando no se proporciona', async () => {
    clientFetchMock.mockResolvedValue({ id: 3, wasHandled: true });

    const { result } = renderHook(() => useHandleRequest(), { wrapper: wrapper(qc) });
    result.current.mutate({ id: 3 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(clientFetchMock).toHaveBeenCalledWith(
      'contact-requests/3/handle',
      expect.objectContaining({ method: 'PATCH', body: {} }),
    );
  });
});

describe('useContactRequests', () => {
  let qc: QueryClient;

  beforeEach(() => {
    clientFetchMock.mockReset();
    qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  it('pasa wasHandled=false como parámetro al listar pendientes', async () => {
    clientFetchMock.mockResolvedValue({ items: [], total: 0, page: 1, limit: 50 });

    const { result } = renderHook(() => useContactRequests(false), { wrapper: wrapper(qc) });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(clientFetchMock).toHaveBeenCalledWith(
      'contact-requests',
      expect.objectContaining({ params: expect.objectContaining({ wasHandled: false }) }),
    );
  });

  it('pasa wasHandled=true al listar atendidas', async () => {
    clientFetchMock.mockResolvedValue({ items: [], total: 0, page: 1, limit: 50 });

    const { result } = renderHook(() => useContactRequests(true), { wrapper: wrapper(qc) });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(clientFetchMock).toHaveBeenCalledWith(
      'contact-requests',
      expect.objectContaining({ params: expect.objectContaining({ wasHandled: true }) }),
    );
  });
});
