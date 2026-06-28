import type { Opportunity, OpportunityStatus, PipelineStage } from '@/lib/api/types/commercial';

/** Minimal structural shape of dnd-kit's Over object needed for drop resolution. */
type OverLike = { data: { current?: Record<string, unknown> } } | null | undefined;

/**
 * Pure function: decides whether a drag-end event should trigger a stage change.
 * Returns the target { id, pipelineStageId } or null (same stage / no valid target).
 */
export function resolveDrop(
  activeId: number,
  over: OverLike,
  opps: Opportunity[],
): { id: number; pipelineStageId: number } | null {
  const overStageId = over?.data.current?.['stageId'] as number | undefined;
  const opp = opps.find((o) => o.id === activeId);
  if (!opp || overStageId == null || overStageId === opp.pipelineStageId) return null;
  return { id: activeId, pipelineStageId: overStageId };
}

export function applyStageMove(
  opps: Opportunity[],
  oppId: number,
  newStageId: number,
  newProbability?: number,
): Opportunity[] {
  return opps.map((o) =>
    o.id === oppId
      ? { ...o, pipelineStageId: newStageId, probability: newProbability ?? o.probability }
      : o,
  );
}

export function applyStatusChange(
  opps: Opportunity[],
  oppId: number,
  status: OpportunityStatus,
  patch: Partial<Opportunity> = {},
): Opportunity[] {
  return opps.map((o) => (o.id === oppId ? { ...o, status, ...patch } : o));
}

export function groupByStage(
  opps: Opportunity[],
  stages: PipelineStage[],
): { stage: PipelineStage; cards: Opportunity[] }[] {
  const ordered = [...stages].sort((a, b) => a.sortOrder - b.sortOrder);
  return ordered.map((stage) => ({
    stage,
    cards: opps.filter((o) => o.pipelineStageId === stage.id),
  }));
}

export function sumColumnAmount(cards: Opportunity[]): number {
  return cards.reduce((acc, c) => acc + (c.amount ?? 0), 0);
}
