import type { MetricsFilters } from './metrics-types';

const KEYS: (keyof MetricsFilters)[] = [
  'from', 'to', 'sectorId', 'areaId', 'clientId',
  'responsibleEmployeeId', 'recruiterId', 'stageId', 'status',
];

export function buildMetricsQuery(filters: MetricsFilters): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of KEYS) {
    const value = filters[key];
    if (value === undefined || value === null || value === '') continue;
    out[key] = String(value);
  }
  return out;
}
