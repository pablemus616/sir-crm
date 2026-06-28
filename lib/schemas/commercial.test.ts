import { describe, it, expect } from 'vitest';
import {
  createOpportunitySchema,
  changeStageSchema,
  createClientContactSchema,
  createContactHistorySchema,
  createClientSchema,
  handleContactRequestSchema,
} from './commercial';

describe('createOpportunitySchema', () => {
  it('acepta payload mínimo y coacciona ids string→number', () => {
    const r = createOpportunitySchema.parse({
      clientId: '3',
      responsibleEmployeeId: '5',
      pipelineStageId: '1',
    });
    expect(r).toMatchObject({ clientId: 3, responsibleEmployeeId: 5, pipelineStageId: 1 });
  });

  it('rechaza headcount < 1', () => {
    expect(() =>
      createOpportunitySchema.parse({
        clientId: 1,
        responsibleEmployeeId: 1,
        pipelineStageId: 1,
        headcount: 0,
      }),
    ).toThrow();
  });

  it('rechaza seniority con valor inválido', () => {
    expect(() =>
      createOpportunitySchema.parse({
        clientId: 1,
        responsibleEmployeeId: 1,
        pipelineStageId: 1,
        seniority: 'invalid-level',
      }),
    ).toThrow();
  });
});

describe('changeStageSchema', () => {
  it('rechaza probability fuera de 0..100', () => {
    expect(() =>
      changeStageSchema.parse({ pipelineStageId: 1, probability: 140 }),
    ).toThrow();
  });
});

describe('createClientContactSchema', () => {
  it('rechaza email inválido', () => {
    expect(() =>
      createClientContactSchema.parse({
        name: 'Ana',
        clientId: 1,
        email: 'no-es-correo',
      }),
    ).toThrow();
  });
});

describe('createContactHistorySchema', () => {
  it('rechaza direction con valor inválido', () => {
    expect(() =>
      createContactHistorySchema.parse({
        contactId: 1,
        contactType: 1,
        contactTime: '2026-06-27T10:00:00Z',
        direction: 'invalid-dir',
      }),
    ).toThrow();
  });
});

describe('optional numeric fields — empty string → undefined (not 0)', () => {
  it('createClientSchema: sectorId vacío → undefined', () => {
    const r = createClientSchema.parse({ name: 'ACME', sectorId: '' });
    expect(r.sectorId).toBeUndefined();
  });

  it('createClientSchema: sectorId "7" → 7', () => {
    const r = createClientSchema.parse({ name: 'ACME', sectorId: '7' });
    expect(r.sectorId).toBe(7);
  });

  it('createClientSchema: employeeSize vacío → undefined', () => {
    const r = createClientSchema.parse({ name: 'ACME', employeeSize: '' });
    expect(r.employeeSize).toBeUndefined();
  });

  it('createOpportunitySchema: areaId vacío → undefined', () => {
    const r = createOpportunitySchema.parse({
      clientId: 1,
      responsibleEmployeeId: 1,
      pipelineStageId: 1,
      areaId: '',
    });
    expect(r.areaId).toBeUndefined();
  });

  it('createOpportunitySchema: amount vacío → undefined', () => {
    const r = createOpportunitySchema.parse({
      clientId: 1,
      responsibleEmployeeId: 1,
      pipelineStageId: 1,
      amount: '',
    });
    expect(r.amount).toBeUndefined();
  });

  it('handleContactRequestSchema: resultingClientId vacío → undefined', () => {
    const r = handleContactRequestSchema.parse({ resultingClientId: '' });
    expect(r.resultingClientId).toBeUndefined();
  });

  it('handleContactRequestSchema: resultingClientId "42" → 42', () => {
    const r = handleContactRequestSchema.parse({ resultingClientId: '42' });
    expect(r.resultingClientId).toBe(42);
  });

  it('createOpportunitySchema: required clientId rejects blank', () => {
    expect(() =>
      createOpportunitySchema.parse({
        clientId: '',
        responsibleEmployeeId: 1,
        pipelineStageId: 1,
      }),
    ).toThrow();
  });
});
