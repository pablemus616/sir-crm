import { describe, it, expect } from 'vitest';
import { sectorsResource } from './sectors';
import { positionAreasResource } from './position-areas';
import { contactTypesResource } from './contact-types';
import { pipelineStagesResource } from './pipeline-stages';

describe('sectorsResource', () => {
  const { config } = sectorsResource;

  it('apunta al endpoint sectors con acceso admin y sin búsqueda', () => {
    expect(config.endpoint).toBe('sectors');
    expect(config.access).toBe('admin');
    expect(config.searchParam).toBeUndefined();
  });

  it('tiene campos name (text) y active (switch)', () => {
    const fields = Object.fromEntries(config.formFields.map((f) => [f.name, f.type]));
    expect(fields).toEqual({ name: 'text', active: 'switch' });
  });

  it('no declara filtros de lista', () => {
    expect(config.filters).toBeUndefined();
  });

  it('valida nombre obligatorio vía formSchema', () => {
    expect(config.formSchema.safeParse({ name: '' }).success).toBe(false);
    expect(config.formSchema.safeParse({ name: 'Tecnología', active: true }).success).toBe(true);
  });
});

describe('positionAreasResource', () => {
  const { config } = positionAreasResource;

  it('apunta al endpoint position-areas con acceso admin y sin búsqueda', () => {
    expect(config.endpoint).toBe('position-areas');
    expect(config.access).toBe('admin');
    expect(config.searchParam).toBeUndefined();
  });

  it('tiene campos name (text) y active (switch)', () => {
    const fields = Object.fromEntries(config.formFields.map((f) => [f.name, f.type]));
    expect(fields).toEqual({ name: 'text', active: 'switch' });
  });

  it('no declara filtros de lista', () => {
    expect(config.filters).toBeUndefined();
  });

  it('valida nombre obligatorio vía formSchema', () => {
    expect(config.formSchema.safeParse({ name: '' }).success).toBe(false);
    expect(config.formSchema.safeParse({ name: 'Ventas' }).success).toBe(true);
  });
});

describe('contactTypesResource', () => {
  const { config } = contactTypesResource;

  it('apunta al endpoint contact-types con acceso admin y sin búsqueda', () => {
    expect(config.endpoint).toBe('contact-types');
    expect(config.access).toBe('admin');
    expect(config.searchParam).toBeUndefined();
  });

  it('solo tiene el campo name (text), sin active', () => {
    expect(config.formFields.map((f) => f.name)).toEqual(['name']);
    expect(config.formFields[0]?.type).toBe('text');
    expect(config.formFields.some((f) => f.name === 'active')).toBe(false);
  });

  it('no declara filtros de lista', () => {
    expect(config.filters).toBeUndefined();
  });

  it('valida nombre obligatorio vía formSchema', () => {
    expect(config.formSchema.safeParse({ name: '' }).success).toBe(false);
    expect(config.formSchema.safeParse({ name: 'Llamada' }).success).toBe(true);
  });
});

describe('pipelineStagesResource', () => {
  const { config } = pipelineStagesResource;

  it('apunta al endpoint pipeline-stages con acceso admin, sin búsqueda y limit 100', () => {
    expect(config.endpoint).toBe('pipeline-stages');
    expect(config.access).toBe('admin');
    expect(config.searchParam).toBeUndefined();
    expect(config.defaultLimit).toBe(100);
  });

  it('tiene sortOrder/probability como number y isWon/isLost/active como switch', () => {
    const fields = Object.fromEntries(config.formFields.map((f) => [f.name, f.type]));
    expect(fields).toEqual({
      name: 'text',
      sortOrder: 'number',
      probability: 'number',
      isWon: 'switch',
      isLost: 'switch',
      active: 'switch',
    });
  });

  it('declara un único filtro toggle por active', () => {
    expect(config.filters).toEqual([
      { key: 'active', label: 'Solo activas', type: 'toggle' },
    ]);
  });

  it('valida sortOrder y probability (0-100) vía formSchema', () => {
    expect(
      config.formSchema.safeParse({ name: 'Prospección', sortOrder: 0, probability: 50 }).success,
    ).toBe(true);
    expect(
      config.formSchema.safeParse({ name: 'X', sortOrder: 1, probability: 101 }).success,
    ).toBe(false);
    expect(
      config.formSchema.safeParse({ name: '', sortOrder: 1, probability: 50 }).success,
    ).toBe(false);
  });
});
