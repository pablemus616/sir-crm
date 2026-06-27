import { describe, expect, it } from 'vitest';
import { filtersToSearchParams, parseFilters } from '../filters';

describe('parseFilters', () => {
  it('coacciona enteros >= 1 y descarta inválidos', () => {
    expect(parseFilters({ sectorId: '3', clientId: '0', areaId: 'x' }))
      .toEqual({ sectorId: 3 });
  });
  it('acepta status válido y rechaza otros', () => {
    expect(parseFilters({ status: 'won' })).toEqual({ status: 'won' });
    expect(parseFilters({ status: 'pending' })).toEqual({});
  });
  it('round-trip con filtersToSearchParams', () => {
    const f = { sectorId: 2, status: 'open' as const, from: '2026-01-01' };
    expect(parseFilters(filtersToSearchParams(f))).toEqual(f);
  });
});

describe('setFilters — rango de fechas', () => {
  it('combinar from+to sobre base con sectorId conserva los tres valores', () => {
    // Simula lo que hace setFilters: merge del parcial sobre los filtros actuales
    const base: ReturnType<typeof parseFilters> = { sectorId: 3 };
    const patch = { from: '2026-01-01', to: '2026-01-31' };
    const merged = { ...base, ...patch };
    const result = parseFilters(filtersToSearchParams(merged));
    expect(result).toEqual({ sectorId: 3, from: '2026-01-01', to: '2026-01-31' });
  });

  it('limpiar el rango (from+to undefined) elimina ambas fechas sin tocar otros filtros', () => {
    const base = { sectorId: 3, from: '2026-01-01', to: '2026-01-31' };
    const patch: { from?: string; to?: string } = { from: undefined, to: undefined };
    const merged = { ...base, ...patch };
    // Eliminar claves undefined (como hace setFilters)
    (Object.keys(patch) as (keyof typeof patch)[]).forEach((k) => {
      if (patch[k] === undefined) delete (merged as Record<string, unknown>)[k];
    });
    const result = parseFilters(filtersToSearchParams(merged));
    expect(result).toEqual({ sectorId: 3 });
  });
});
