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
