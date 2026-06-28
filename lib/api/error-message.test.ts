import { describe, it, expect } from 'vitest';
import { toSpanishError } from './error-message';

describe('toSpanishError', () => {
  it('mapea "Username already exists"', () => {
    expect(toSpanishError(new Error('Username already exists'))).toBe(
      'El nombre de usuario ya existe.',
    );
  });

  it('mapea "Permission already exists"', () => {
    expect(toSpanishError(new Error('Permission already exists'))).toBe(
      'Ya existe un permiso con ese nombre.',
    );
  });

  it('mapea "Role already exists"', () => {
    expect(toSpanishError(new Error('Role already exists'))).toBe(
      'Ya existe un rol con ese nombre.',
    );
  });

  it('mapea conflicto de Application a la frase específica', () => {
    expect(
      toSpanishError(
        new Error('Application for candidate 1 and opportunity 2 already exists'),
      ),
    ).toBe('Ya existe una aplicación para ese candidato y esa oportunidad.');
  });

  it('mapea un "already exists" genérico', () => {
    expect(toSpanishError(new Error('Contact already exists'))).toBe(
      'Ya existe un registro con esos datos.',
    );
  });

  it('devuelve el mensaje original cuando no hay mapeo (passthrough de Error)', () => {
    expect(toSpanishError(new Error('Illegal transition'))).toBe('Illegal transition');
  });

  it('devuelve el fallback cuando no es un Error', () => {
    expect(toSpanishError('boom')).toBe('Ocurrió un error.');
    expect(toSpanishError(undefined, 'No se pudo guardar.')).toBe('No se pudo guardar.');
  });
});
