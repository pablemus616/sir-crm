import { describe, it, expect } from 'vitest';
import { applyStageMove, applyStatusChange, groupByStage, sumColumnAmount, resolveDrop } from './move-stage';
import type { Opportunity, PipelineStage } from '@/lib/api/types/commercial';

const opp = (id: number, stageId: number, amount?: number): Opportunity =>
  ({
    id,
    pipelineStageId: stageId,
    probability: 10,
    amount,
    status: 'open',
    clientId: 1,
    responsibleEmployeeId: 1,
    headcount: 1,
    currency: 'GTQ',
    createdAt: '',
    updatedAt: '',
  }) as Opportunity;

const stages: PipelineStage[] = [
  { id: 1, name: 'Prospecto', sortOrder: 1, probability: 10, isWon: false, isLost: false, active: true },
  { id: 2, name: 'Propuesta', sortOrder: 2, probability: 50, isWon: false, isLost: false, active: true },
];

describe('applyStageMove', () => {
  it('cambia la etapa y la probabilidad de la oportunidad indicada sin mutar el original', () => {
    const before = [opp(1, 1), opp(2, 1)];
    const after = applyStageMove(before, 1, 2, 50);
    expect(after.find((o) => o.id === 1)).toMatchObject({ pipelineStageId: 2, probability: 50 });
    expect(after.find((o) => o.id === 2)?.pipelineStageId).toBe(1);
    expect(before[0].pipelineStageId).toBe(1); // inmutable
  });

  it('mantiene la probabilidad previa si no se especifica', () => {
    expect(applyStageMove([opp(1, 1)], 1, 2)[0].probability).toBe(10);
  });
});

describe('applyStatusChange', () => {
  it('marca status won y aplica patch', () => {
    const after = applyStatusChange([opp(1, 1)], 1, 'won', { pipelineStageId: 2 });
    expect(after[0]).toMatchObject({ status: 'won', pipelineStageId: 2 });
  });
});

describe('groupByStage', () => {
  it('agrupa por etapa respetando el orden de stages', () => {
    const groups = groupByStage([opp(1, 2), opp(2, 1)], stages);
    expect(groups.map((g) => g.stage.id)).toEqual([1, 2]);
    expect(groups[0].cards.map((c) => c.id)).toEqual([2]);
    expect(groups[1].cards.map((c) => c.id)).toEqual([1]);
  });
});

describe('sumColumnAmount', () => {
  it('suma montos ignorando null/undefined', () => {
    expect(sumColumnAmount([opp(1, 1, 100), opp(2, 1), opp(3, 1, 50)])).toBe(150);
  });
});

describe('resolveDrop', () => {
  it('devuelve el id y el nuevo stageId cuando la tarjeta cae en otra columna', () => {
    const result = resolveDrop(1, { data: { current: { stageId: 2 } } }, [opp(1, 1)]);
    expect(result).toEqual({ id: 1, pipelineStageId: 2 });
  });

  it('devuelve null en un drop dentro de la misma columna', () => {
    expect(resolveDrop(1, { data: { current: { stageId: 1 } } }, [opp(1, 1)])).toBeNull();
  });

  it('devuelve null cuando over.data.current no tiene stageId', () => {
    expect(resolveDrop(1, { data: { current: {} } }, [opp(1, 1)])).toBeNull();
  });

  it('devuelve null cuando over es null (soltado fuera de cualquier zona)', () => {
    expect(resolveDrop(1, null, [opp(1, 1)])).toBeNull();
  });
});
