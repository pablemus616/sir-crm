import { describe, it, expect } from 'vitest';
import { employeesResource } from './employees';
import { permissionsResource } from './permissions';
import { createEmployeeSchema } from '@/lib/schemas/admin';

describe('employeesResource', () => {
  const { config } = employeesResource;

  it('apunta al endpoint employees con acceso admin y sin búsqueda', () => {
    expect(config.endpoint).toBe('employees');
    expect(config.access).toBe('admin');
    // /employees solo pagina, no admite búsqueda por texto.
    expect(config.searchParam).toBeUndefined();
    expect(config.defaultLimit).toBe(20);
  });

  it('renderiza el formulario largo en un Sheet', () => {
    expect(config.formContainer).toBe('sheet');
  });

  it('expone los 10 campos de formulario esperados', () => {
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
      'hireDate',
      'salary',
    ]);
  });

  it('tipa birthDate y hireDate como date, salary como number, email como email', () => {
    const types = Object.fromEntries(config.formFields.map((f) => [f.name, f.type]));
    expect(types.birthDate).toBe('date');
    expect(types.hireDate).toBe('date');
    expect(types.salary).toBe('number');
    expect(types.email).toBe('email');
  });

  it('no declara filtros de lista', () => {
    expect(config.filters).toBeUndefined();
  });

  it('valida que firstName y lastName son obligatorios vía formSchema', () => {
    expect(config.formSchema.safeParse({ firstName: '', lastName: '' }).success).toBe(false);
    expect(
      config.formSchema.safeParse({ firstName: 'Ana', lastName: 'López' }).success,
    ).toBe(true);
  });
});

describe('permissionsResource', () => {
  const { config } = permissionsResource;

  it('apunta al endpoint permissions con acceso admin y sin búsqueda', () => {
    expect(config.endpoint).toBe('permissions');
    expect(config.access).toBe('admin');
    expect(config.searchParam).toBeUndefined();
  });

  it('solo tiene el campo name (text)', () => {
    expect(config.formFields.map((f) => f.name)).toEqual(['name']);
    expect(config.formFields[0]?.type).toBe('text');
  });

  it('no declara filtros de lista', () => {
    expect(config.filters).toBeUndefined();
  });
});

describe('createEmployeeSchema', () => {
  it('acepta el mínimo {firstName, lastName}', () => {
    const result = createEmployeeSchema.safeParse({ firstName: 'Ana', lastName: 'López' });
    expect(result.success).toBe(true);
  });

  it("convierte birthDate '' en undefined", () => {
    const result = createEmployeeSchema.safeParse({
      firstName: 'Ana',
      lastName: 'López',
      birthDate: '',
      hireDate: '',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.birthDate).toBeUndefined();
      expect(result.data.hireDate).toBeUndefined();
    }
  });

  it('rechaza email inválido pero acepta cadena vacía', () => {
    expect(
      createEmployeeSchema.safeParse({ firstName: 'Ana', lastName: 'López', email: 'no-es-email' })
        .success,
    ).toBe(false);
    expect(
      createEmployeeSchema.safeParse({ firstName: 'Ana', lastName: 'López', email: '' }).success,
    ).toBe(true);
  });

  it('acepta una fila GET con nulls (round-trip de edición) y los omite', () => {
    // GET /employees/:id devuelve null para columnas nullable sin valor;
    // ResourceView siembra defaultValues=row, así que RHF retiene null.
    const result = createEmployeeSchema.safeParse({
      firstName: 'Ana',
      lastName: 'López',
      secondName: null,
      surName: null,
      nationalId: null,
      phoneNumber: null,
      email: null,
      birthDate: null,
      hireDate: null,
      salary: null,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.secondName).toBeUndefined();
      expect(result.data.surName).toBeUndefined();
      expect(result.data.nationalId).toBeUndefined();
      expect(result.data.phoneNumber).toBeUndefined();
      expect(result.data.email).toBeUndefined();
    }
  });

  it("convierte campos de texto opcionales '' en undefined (create omite la clave)", () => {
    const result = createEmployeeSchema.safeParse({
      firstName: 'Ana',
      lastName: 'López',
      secondName: '',
      surName: '',
      nationalId: '',
      phoneNumber: '',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.secondName).toBeUndefined();
      expect(result.data.surName).toBeUndefined();
      expect(result.data.nationalId).toBeUndefined();
      expect(result.data.phoneNumber).toBeUndefined();
    }
  });
});

describe('createPermissionSchema', () => {
  const { config } = permissionsResource;

  it('rechaza nombre vacío y acepta uno válido', () => {
    expect(config.formSchema.safeParse({ name: '' }).success).toBe(false);
    expect(config.formSchema.safeParse({ name: 'manage_users' }).success).toBe(true);
  });
});
