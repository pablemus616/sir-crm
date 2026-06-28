'use client';
import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { clientFetch } from '@/lib/api/client';
import type { Paginated } from '@/lib/api/types';
import type { Opportunity, PipelineStage } from '@/lib/api/types/commercial';
import { applyStageMove, applyStatusChange } from '@/lib/kanban/move-stage';
import type {
  ChangeStageInput,
  SendProposalInput,
  FollowUpInput,
  LoseOpportunityInput,
  CreateOpportunityInput,
} from '@/lib/schemas/commercial';

export const OPP_KANBAN_KEY = ['opportunities', 'kanban'] as const;
type Board = Paginated<Opportunity>;
type Snapshot = [ReadonlyArray<unknown>, Board | undefined];

export function useActiveStages() {
  return useQuery({
    queryKey: ['pipeline-stages', 'active'],
    queryFn: () =>
      clientFetch<Paginated<PipelineStage>>('pipeline-stages', {
        params: { active: true, limit: 100 },
      }),
    select: (p) => [...p.items].sort((a, b) => a.sortOrder - b.sortOrder),
  });
}

export function useKanbanOpportunities(
  filters: Record<string, string | number | undefined> = {},
) {
  return useQuery({
    queryKey: [...OPP_KANBAN_KEY, filters],
    queryFn: () =>
      clientFetch<Board>('opportunities', {
        params: { limit: 200, status: 'open', ...filters },
      }),
  });
}

// ---------------------------------------------------------------------------
// Optimistic mutation factory
// ---------------------------------------------------------------------------

function makeOptimistic<TVars extends { id: number }>(
  qc: QueryClient,
  endpoint: (v: TVars) => string,
  body: (v: TVars) => unknown | undefined,
  updater: (items: Opportunity[], v: TVars) => Opportunity[],
  okMsg: string,
) {
  return {
    mutationFn: (v: TVars) =>
      clientFetch<Opportunity>(endpoint(v), {
        method: 'PATCH',
        ...(body(v) !== undefined ? { body: body(v) } : {}),
      }),
    onMutate: async (v: TVars) => {
      await qc.cancelQueries({ queryKey: OPP_KANBAN_KEY });
      const snapshots: Snapshot[] = qc.getQueriesData<Board>({ queryKey: OPP_KANBAN_KEY });
      for (const [key, data] of snapshots) {
        if (data) {
          qc.setQueryData<Board>(key as unknown[], {
            ...data,
            items: updater(data.items, v),
          });
        }
      }
      return { snapshots };
    },
    onError: (
      _e: Error,
      _v: TVars,
      ctx?: { snapshots: Snapshot[] },
    ) => {
      ctx?.snapshots.forEach(([key, data]) =>
        qc.setQueryData(key as unknown[], data),
      );
      toast.error('No se pudo actualizar la oportunidad');
    },
    onSuccess: () => toast.success(okMsg),
    onSettled: () => qc.invalidateQueries({ queryKey: OPP_KANBAN_KEY }),
  };
}

// ---------------------------------------------------------------------------
// Action hooks
// ---------------------------------------------------------------------------

export function useChangeStage() {
  const qc = useQueryClient();
  return useMutation(
    makeOptimistic<{ id: number } & ChangeStageInput>(
      qc,
      (v) => `opportunities/${v.id}/stage`,
      ({ pipelineStageId, probability, lostReason }) => ({
        pipelineStageId,
        probability,
        lostReason,
      }),
      (items, v) => applyStageMove(items, v.id, v.pipelineStageId, v.probability),
      'Etapa actualizada',
    ),
  );
}

export function useSendProposal() {
  const qc = useQueryClient();
  return useMutation(
    makeOptimistic<{ id: number } & SendProposalInput>(
      qc,
      (v) => `opportunities/${v.id}/proposal`,
      ({ amount }) => ({ amount }),
      (items, v) =>
        applyStatusChange(items, v.id, 'open', {
          amount: v.amount,
          proposalSentAt: new Date().toISOString(),
        }),
      'Propuesta enviada',
    ),
  );
}

export function useFollowUp() {
  const qc = useQueryClient();
  return useMutation(
    makeOptimistic<{ id: number } & FollowUpInput>(
      qc,
      (v) => `opportunities/${v.id}/follow-up`,
      ({ nextFollowUpAt }) => ({ nextFollowUpAt }),
      (items, v) =>
        items.map((o) =>
          o.id === v.id ? { ...o, nextFollowUpAt: v.nextFollowUpAt } : o,
        ),
      'Seguimiento programado',
    ),
  );
}

export function useWinOpportunity() {
  const qc = useQueryClient();
  return useMutation(
    makeOptimistic<{ id: number }>(
      qc,
      (v) => `opportunities/${v.id}/win`,
      () => undefined,
      (items, v) =>
        applyStatusChange(items, v.id, 'won', { wonAt: new Date().toISOString() }),
      'Oportunidad ganada',
    ),
  );
}

export function useLoseOpportunity() {
  const qc = useQueryClient();
  return useMutation(
    makeOptimistic<{ id: number } & LoseOpportunityInput>(
      qc,
      (v) => `opportunities/${v.id}/lose`,
      ({ lostReason }) => ({ lostReason }),
      (items, v) =>
        applyStatusChange(items, v.id, 'lost', {
          lostReason: v.lostReason,
          lostAt: new Date().toISOString(),
        }),
      'Oportunidad perdida',
    ),
  );
}

export function useCreateOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOpportunityInput) =>
      clientFetch<Opportunity>('opportunities', {
        method: 'POST',
        body: input,
      }),
    onSuccess: () => {
      toast.success('Oportunidad creada');
      qc.invalidateQueries({ queryKey: OPP_KANBAN_KEY });
    },
    onError: () => toast.error('No se pudo crear la oportunidad'),
  });
}
