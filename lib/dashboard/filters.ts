import type { MetricsFilters, OpportunityStatus } from '@/lib/api/metrics-types';

const NUM_KEYS = [
  'sectorId', 'areaId', 'clientId',
  'responsibleEmployeeId', 'recruiterId', 'stageId',
] as const;
const STATUSES: OpportunityStatus[] = ['open', 'won', 'lost'];

type ParamLike = URLSearchParams | Record<string, string | undefined>;

function read(params: ParamLike, key: string): string | undefined {
  if (params instanceof URLSearchParams) return params.get(key) ?? undefined;
  return params[key];
}

export function parseFilters(params: ParamLike): MetricsFilters {
  const out: MetricsFilters = {};
  for (const key of NUM_KEYS) {
    const raw = read(params, key);
    if (raw === undefined) continue;
    const n = Number.parseInt(raw, 10);
    if (Number.isInteger(n) && n >= 1) out[key] = n;
  }
  const from = read(params, 'from');
  const to = read(params, 'to');
  if (from) out.from = from;
  if (to) out.to = to;
  const status = read(params, 'status');
  if (status && STATUSES.includes(status as OpportunityStatus)) {
    out.status = status as OpportunityStatus;
  }
  return out;
}

export function filtersToSearchParams(filters: MetricsFilters): URLSearchParams {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === '') continue;
    sp.set(key, String(value));
  }
  return sp;
}
