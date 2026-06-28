import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const clientFetchMock = vi.fn();
vi.mock('@/lib/api/client', () => ({
  clientFetch: (...a: unknown[]) => clientFetchMock(...a),
}));

import { useLogContact, useContactHistory } from './contact-history';

function wrapper(qc: QueryClient) {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe('useLogContact', () => {
  let qc: QueryClient;

  beforeEach(() => {
    clientFetchMock.mockReset();
    qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  });

  it('hace POST a contact-history con un body sin employeeId', async () => {
    clientFetchMock.mockResolvedValue({ id: 1, contactId: 7, contactTime: '2026-06-28T10:00:00.000Z' });

    const { result } = renderHook(() => useLogContact(), { wrapper: wrapper(qc) });
    result.current.mutate({
      contactId: 7,
      contactType: 2,
      contactTime: '2026-06-28T10:00:00.000Z',
      direction: 'outbound',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(clientFetchMock).toHaveBeenCalledWith(
      'contact-history',
      expect.objectContaining({ method: 'POST' }),
    );
    const [, init] = clientFetchMock.mock.calls[0] as [string, { body: Record<string, unknown> }];
    expect(init.body).not.toHaveProperty('employeeId');
    expect(init.body).toMatchObject({ contactId: 7, contactType: 2, direction: 'outbound' });
  });
});

describe('useContactHistory', () => {
  let qc: QueryClient;

  beforeEach(() => {
    clientFetchMock.mockReset();
    qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  it('pasa los filtros a params y omite los vacíos, incluyendo limit:50', async () => {
    clientFetchMock.mockResolvedValue({ items: [], total: 0, page: 1, limit: 50 });

    const { result } = renderHook(
      () =>
        useContactHistory({
          clientId: 4,
          direction: 'inbound',
          from: '2026-06-01',
          contactId: undefined,
          to: '',
        }),
      { wrapper: wrapper(qc) },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(clientFetchMock).toHaveBeenCalledWith(
      'contact-history',
      expect.objectContaining({
        params: expect.objectContaining({
          limit: 50,
          clientId: 4,
          direction: 'inbound',
          from: '2026-06-01',
        }),
      }),
    );
    const [, init] = clientFetchMock.mock.calls[0] as [string, { params: Record<string, unknown> }];
    expect(init.params).not.toHaveProperty('contactId');
    expect(init.params).not.toHaveProperty('to');
  });
});
