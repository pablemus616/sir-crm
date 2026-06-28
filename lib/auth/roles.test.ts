import { describe, it, expect } from 'vitest';
import { hasRole, isAdmin } from './roles';

// Minimal shape: roles.ts only reads me.roles[].name.
const meWith = (...names: string[]) => ({
  roles: names.map((name, i) => ({ id: String(i + 1), name })),
});

describe('hasRole', () => {
  it('detecta el rol (case-insensitive)', () => {
    expect(hasRole(meWith('Reclutador', 'ADMIN'), 'admin')).toBe(true);
    expect(hasRole(meWith('reclutador'), 'Reclutador')).toBe(true);
  });

  it('devuelve false cuando el rol no está', () => {
    expect(hasRole(meWith('reclutador', 'gerente'), 'admin')).toBe(false);
    expect(hasRole(meWith(), 'admin')).toBe(false);
  });
});

describe('isAdmin', () => {
  it('true solo si existe el rol admin (gate de rutas /(admin))', () => {
    expect(isAdmin(meWith('admin'))).toBe(true);
    expect(isAdmin(meWith('ADMIN'))).toBe(true);
    expect(isAdmin(meWith('reclutador'))).toBe(false);
    expect(isAdmin(meWith())).toBe(false);
  });
});
