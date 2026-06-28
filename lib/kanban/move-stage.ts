import type { Opportunity, OpportunityStatus, PipelineStage } from '@/lib/api/types/commercial';

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
