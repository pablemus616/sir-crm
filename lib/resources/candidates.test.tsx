import { describe, it, expect } from 'vitest';
import { candidatesResource } from './candidates';
import { CANDIDATE_STATUSES } from '@/lib/api/types/recruitment';

const { config } = candidatesResource;

describe('candidatesResource', () => {
  it('apunta al endpoint candidates con acceso auth y busca por name', () => {
    expect(config.endpoint).toBe('candidates');
    expect(config.access).toBe('auth');
    // El backend de /candidates honra `name`, no un `search` genérico.
    expect(config.searchParam).toBe('name');
    expect(config.defaultLimit).toBe(20);
  });

  it('expone los campos de formulario esperados', () => {
    const names = config.formFields.map((f) => f.name);
    expect(names).toEqual([
      'firstName',
      'secondName',
      'lastName',
      'surName',
      'nationalId',
      'phoneNumber',
      'email',
      'birthDate',
      'headline',
      'source',
      'expectedSalary',
      'status',
      'notes',
    ]);
  });

  it('usa el tipo de campo date para birthDate', () => {
    const birthDate = config.formFields.find((f) => f.name === 'birthDate');
    expect(birthDate?.type).toBe('date');
  });

  it('status es un select con las 5 opciones de CANDIDATE_STATUSES', () => {
    const status = config.formFields.find((f) => f.name === 'status');
    expect(status?.type).toBe('select');
    expect(status?.options).toHaveLength(5);
    expect(status?.options?.map((o) => o.value)).toEqual([...CANDIDATE_STATUSES]);
  });

  it('incluye una columna de Estado', () => {
    const statusColumn = config.columns.find((c) => c.id === 'status');
    expect(statusColumn).toBeDefined();
    expect(statusColumn?.header).toBe('Estado');
  });

  it('renderiza la tabla en un Sheet por ser un formulario largo', () => {
    expect(config.formContainer).toBe('sheet');
  });

  it('valida que firstName y lastName son obligatorios', () => {
    expect(config.formSchema.safeParse({ firstName: '', lastName: '' }).success).toBe(false);
    expect(
      config.formSchema.safeParse({ firstName: 'Ana', lastName: 'López' }).success,
    ).toBe(true);
  });
});
