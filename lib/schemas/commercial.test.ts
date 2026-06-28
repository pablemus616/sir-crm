import { describe, it, expect } from 'vitest';
import {
  createOpportunitySchema,
  changeStageSchema,
  createClientContactSchema,
  createContactHistorySchema,
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
