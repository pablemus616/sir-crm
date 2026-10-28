import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const clientFetchMock = vi.fn();
vi.mock('@/lib/api/client', () => ({
  clientFetch: (...a: unknown[]) => clientFetchMock(...a),
}));

import { OPP_KANBAN_KEY, useChangeStage, useKanbanOpportunities } from './opportunities';
import type { Opportunity } from '@/lib/api/types/commercial';

const card = (id: number, stageId: number): Opportunity =>
  ({
    id,
    pipelineStageId: stageId,
    probability: 10,
    status: 'open',
    clientId: 1,
    responsibleEmployeeId: 1,
    headcount: 1,
    currency: 'GTQ',
    createdAt: '',
    updatedAt: '',
  }) as Opportunity;

function wrapper(qc: QueryClient) {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe('useChangeStage', () => {
  let qc: QueryClient;

  beforeEach(() => {
    clientFetchMock.mockReset();
    qc = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    qc.setQueryData(OPP_KANBAN_KEY, {
      items: [card(1, 1), card(2, 1)],
      total: 2,
      page: 1,
      limit: 200,
    });
  });

  it('aplica optimismo: mueve la tarjeta de etapa antes de resolver', async () => {
    clientFetchMock.mockImplementation(() => new Promise(() => {})); // pendiente infinito
    const { result } = renderHook(() => useChangeStage(), { wrapper: wrapper(qc) });
    result.current.mutate({ id: 1, pipelineStageId: 2, probability: 50 });
    await waitFor(() => {
      const data = qc.getQueryData<{ items: Opportunity[] }>(OPP_KANBAN_KEY);
      expect(data?.items.find((o) => o.id === 1)?.pipelineStageId).toBe(2);
    });
    expect(clientFetchMock).toHaveBeenCalledWith(
      'opportunities/1/stage',
      expect.objectContaining({ method: 'PATCH' }),
    );
  });

  it('al soltar en una etapa ganada la marca won sin sacarla del tablero', async () => {
    clientFetchMock.mockImplementation(() => new Promise(() => {})); // pendiente infinito
    const { result } = renderHook(() => useChangeStage(), { wrapper: wrapper(qc) });
    result.current.mutate({ id: 1, pipelineStageId: 9, probability: 100, status: 'won' });
    await waitFor(() => {
      const data = qc.getQueryData<{ items: Opportunity[] }>(OPP_KANBAN_KEY);
      expect(data?.items.find((o) => o.id === 1)).toMatchObject({
        pipelineStageId: 9,
        status: 'won',
      });
    });
    // `status` solo alimenta el optimismo: el backend lo deriva de la etapa.
    const [, opts] = clientFetchMock.mock.calls[0];
    expect(opts.body).toEqual({ pipelineStageId: 9, probability: 100, lostReason: undefined });
  });

  it('hace rollback si el backend falla', async () => {
    clientFetchMock.mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useChangeStage(), { wrapper: wrapper(qc) });
    result.current.mutate({ id: 1, pipelineStageId: 2 });
    await waitFor(() => expect(result.current.isError).toBe(true));
    const data = qc.getQueryData<{ items: Opportunity[] }>(OPP_KANBAN_KEY);
    expect(data?.items.find((o) => o.id === 1)?.pipelineStageId).toBe(1); // restaurado
  });

  it('invalida las queries tras éxito (onSettled)', async () => {
    clientFetchMock.mockResolvedValue(card(1, 2));
    const invalidateSpy = vi.spyOn(qc, 'invalidateQueries');
    const { result } = renderHook(() => useChangeStage(), { wrapper: wrapper(qc) });
    result.current.mutate({ id: 1, pipelineStageId: 2 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: OPP_KANBAN_KEY }),
    );
    // Y las métricas, para que el dashboard no sirva KPIs viejos de la caché.
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['metrics'] }),
    );
  });
});

describe('useKanbanOpportunities', () => {
  beforeEach(() => clientFetchMock.mockReset());

  it('no filtra por status: las ganadas/perdidas siguen en su columna', async () => {
    clientFetchMock.mockResolvedValue({ items: [], total: 0, page: 1, limit: 200 });
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    renderHook(() => useKanbanOpportunities(), { wrapper: wrapper(qc) });
    await waitFor(() => expect(clientFetchMock).toHaveBeenCalled());
    const [path, opts] = clientFetchMock.mock.calls[0];
    expect(path).toBe('opportunities');
    expect(opts.params).not.toHaveProperty('status');
  });
});
