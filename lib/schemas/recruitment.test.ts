import { describe, it, expect } from 'vitest';
import {
  createCandidateSchema,
  updateCandidateSchema,
  createApplicationSchema,
  changeApplicationStageSchema,
  createPlacementSchema,
  updatePlacementSchema,
} from './recruitment';
import {
  APPLICATION_TRANSITIONS,
  allowedNextStages,
} from '@/lib/domain/recruitment-labels';

describe('createCandidateSchema', () => {
  it('acepta un candidato completo y válido', () => {
    const r = createCandidateSchema.parse({
      firstName: 'Ana',
      secondName: 'María',
      lastName: 'García',
      surName: 'López',
      nationalId: 'X1234567',
      phoneNumber: '5551234',
      email: 'ana@example.com',
      birthDate: '1990-05-12',
      headline: 'Backend dev',
      source: 'LinkedIn',
      expectedSalary: 35000,
      status: 'active',
      notes: 'Buen perfil',
    });
    expect(r).toMatchObject({
      firstName: 'Ana',
      lastName: 'García',
      expectedSalary: 35000,
      status: 'active',
    });
  });

  it('acepta el payload mínimo {firstName, lastName}', () => {
    const r = createCandidateSchema.parse({ firstName: 'Ana', lastName: 'García' });
    expect(r.firstName).toBe('Ana');
    expect(r.lastName).toBe('García');
  });

  it('rechaza firstName vacío', () => {
    expect(() =>
      createCandidateSchema.parse({ firstName: '', lastName: 'García' }),
    ).toThrow();
  });

  it('rechaza expectedSalary negativo', () => {
    expect(() =>
      createCandidateSchema.parse({
        firstName: 'Ana',
        lastName: 'García',
        expectedSalary: -1,
      }),
    ).toThrow();
  });

  it('status "" → undefined (lección 5.9: enum opcional no debe romper)', () => {
    const r = createCandidateSchema.parse({
      firstName: 'Ana',
      lastName: 'García',
      status: '',
    });
    expect(r.status).toBeUndefined();
  });

  it('rechaza status con un valor inválido', () => {
    expect(() =>
      createCandidateSchema.parse({
        firstName: 'Ana',
        lastName: 'García',
        status: 'unknown',
      }),
    ).toThrow();
  });

  it('birthDate "" → undefined (fecha opcional no debe romper, igual que enums)', () => {
    const r = createCandidateSchema.parse({
      firstName: 'Ana',
      lastName: 'García',
      birthDate: '',
    });
    expect(r.birthDate).toBeUndefined();
  });

  it('updateCandidateSchema es totalmente parcial (objeto vacío válido)', () => {
    expect(() => updateCandidateSchema.parse({})).not.toThrow();
  });
});

describe('createApplicationSchema', () => {
  it('acepta payload válido', () => {
    const r = createApplicationSchema.parse({
      candidateId: 3,
      opportunityId: 7,
      referredByEmployeeId: 5,
      stage: 'screening',
      source: 'Referido',
      notes: 'Contactar',
    });
    expect(r).toMatchObject({ candidateId: 3, opportunityId: 7, stage: 'screening' });
  });

  it('rechaza cuando falta candidateId', () => {
    expect(() => createApplicationSchema.parse({ opportunityId: 7 })).toThrow();
  });

  it('coacciona ids string → number', () => {
    const r = createApplicationSchema.parse({ candidateId: '3', opportunityId: '7' });
    expect(r.candidateId).toBe(3);
    expect(r.opportunityId).toBe(7);
  });

  it('stage "" → undefined (lección 5.9)', () => {
    const r = createApplicationSchema.parse({
      candidateId: 1,
      opportunityId: 1,
      stage: '',
    });
    expect(r.stage).toBeUndefined();
  });

  it('referredByEmployeeId "" → undefined', () => {
    const r = createApplicationSchema.parse({
      candidateId: 1,
      opportunityId: 1,
      referredByEmployeeId: '',
    });
    expect(r.referredByEmployeeId).toBeUndefined();
  });
});

describe('changeApplicationStageSchema', () => {
  it('acepta un stage válido', () => {
    expect(changeApplicationStageSchema.parse({ stage: 'interview' })).toEqual({
      stage: 'interview',
    });
  });

  it('rechaza un stage inválido', () => {
    expect(() => changeApplicationStageSchema.parse({ stage: 'nope' })).toThrow();
  });

  it('rechaza stage vacío (requerido, sin preprocess)', () => {
    expect(() => changeApplicationStageSchema.parse({ stage: '' })).toThrow();
  });
});

describe('createPlacementSchema', () => {
  it('acepta payload con placementDate y fees opcionales', () => {
    const r = createPlacementSchema.parse({
      applicationId: 4,
      placementDate: '2026-06-01',
      startDate: '2026-06-15',
      agreedSalary: 40000,
      fee: 5000,
      status: 'active',
    });
    expect(r).toMatchObject({
      applicationId: 4,
      placementDate: '2026-06-01',
      agreedSalary: 40000,
      fee: 5000,
    });
  });

  it('acepta payload mínimo {applicationId, placementDate}', () => {
    const r = createPlacementSchema.parse({
      applicationId: 4,
      placementDate: '2026-06-01',
    });
    expect(r.placementDate).toBe('2026-06-01');
  });

  it('rechaza cuando falta placementDate', () => {
    expect(() => createPlacementSchema.parse({ applicationId: 4 })).toThrow();
  });

  it('status "" → undefined (lección 5.9)', () => {
    const r = createPlacementSchema.parse({
      applicationId: 4,
      placementDate: '2026-06-01',
      status: '',
    });
    expect(r.status).toBeUndefined();
  });

  it('startDate/endDate "" → undefined (fechas opcionales no deben romper el form)', () => {
    const r = createPlacementSchema.parse({
      applicationId: 4,
      placementDate: '2026-06-01',
      startDate: '',
      endDate: '',
    });
    expect(r.startDate).toBeUndefined();
    expect(r.endDate).toBeUndefined();
  });

  it('rechaza fee negativo', () => {
    expect(() =>
      createPlacementSchema.parse({
        applicationId: 4,
        placementDate: '2026-06-01',
        fee: -10,
      }),
    ).toThrow();
  });

  it('updatePlacementSchema no acepta applicationId (omitido) y es parcial', () => {
    const r = updatePlacementSchema.parse({ status: 'ended' });
    expect(r.status).toBe('ended');
    expect('applicationId' in r).toBe(false);
  });
});

describe('APPLICATION_TRANSITIONS (máquina de estados del backend)', () => {
  it('estados terminales no tienen transiciones', () => {
    expect(APPLICATION_TRANSITIONS.hired).toEqual([]);
    expect(APPLICATION_TRANSITIONS.rejected).toEqual([]);
    expect(APPLICATION_TRANSITIONS.withdrawn).toEqual([]);
  });

  it('applied → [screening, rejected, withdrawn]', () => {
    expect(APPLICATION_TRANSITIONS.applied).toEqual([
      'screening',
      'rejected',
      'withdrawn',
    ]);
  });

  it('allowedNextStages refleja el mapa', () => {
    expect(allowedNextStages('offer')).toEqual(['hired', 'rejected', 'withdrawn']);
    expect(allowedNextStages('hired')).toEqual([]);
  });
});
