'use client';

import * as React from 'react';
import { useDashboardFilters } from '@/lib/dashboard/use-dashboard-filters';
import { useList } from '@/lib/api/hooks';
import { FilterSelect } from './filter-select';
import { DateRangeFilter } from './date-range-filter';
import { Button } from '@/components/ui/button';

const STATUS_OPTIONS = [
  { value: 'open', label: 'Abiertas' },
  { value: 'won', label: 'Ganadas' },
  { value: 'lost', label: 'Perdidas' },
];

function DashboardFiltersInner() {
  const { filters, setFilter, setFilters, reset } = useDashboardFilters();

  const sectors = useList<{ id: number; name: string }>('sectors', { limit: 200 });
  const areas = useList<{ id: number; name: string }>('position-areas', { limit: 200 });
  const clients = useList<{ id: number; name: string }>('clients', { limit: 200 });
  const employees = useList<{ id: number; name: string }>('employees', { limit: 200 });
  const stages = useList<{ id: number; name: string }>('pipeline-stages', {
    active: true,
    limit: 200,
  });

  const opts = (items?: { id: number; name: string }[]) =>
    (items ?? []).map((i) => ({ value: String(i.id), label: i.name }));

  const num = (v: string | undefined) => (v ? Number(v) : undefined);

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b border-border bg-background/95 py-3 backdrop-blur">
      <DateRangeFilter
        from={filters.from}
        to={filters.to}
        onChange={(from, to) => setFilters({ from, to })}
      />
      <FilterSelect
        placeholder="Sector"
        value={filters.sectorId}
        options={opts(sectors.data?.items)}
        onChange={(v) => setFilter('sectorId', num(v))}
      />
      <FilterSelect
        placeholder="Área"
        value={filters.areaId}
        options={opts(areas.data?.items)}
        onChange={(v) => setFilter('areaId', num(v))}
      />
      <FilterSelect
        placeholder="Cliente"
        value={filters.clientId}
        options={opts(clients.data?.items)}
        onChange={(v) => setFilter('clientId', num(v))}
      />
      <FilterSelect
        placeholder="Responsable"
        value={filters.responsibleEmployeeId}
        options={opts(employees.data?.items)}
        onChange={(v) => setFilter('responsibleEmployeeId', num(v))}
      />
      <FilterSelect
        placeholder="Etapa"
        value={filters.stageId}
        options={opts(stages.data?.items)}
        onChange={(v) => setFilter('stageId', num(v))}
      />
      <FilterSelect
        placeholder="Estado"
        value={filters.status}
        options={STATUS_OPTIONS}
        onChange={(v) => setFilter('status', v as 'open' | 'won' | 'lost' | undefined)}
      />
      <Button variant="ghost" size="sm" onClick={reset}>
        Limpiar
      </Button>
    </div>
  );
}

function DashboardFiltersFallback() {
  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b border-border bg-background/95 py-3 backdrop-blur">
      <div className="h-8 w-36 animate-pulse rounded-lg bg-muted" />
      <div className="h-8 w-44 animate-pulse rounded-lg bg-muted" />
      <div className="h-8 w-44 animate-pulse rounded-lg bg-muted" />
      <div className="h-8 w-44 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}

/**
 * Dashboard filter bar — sticky top strip with date range + catalog selects.
 * Wraps the inner component (which uses useSearchParams) in a Suspense boundary
 * so Next.js SSR does not block the rest of the page.
 */
export function DashboardFilters() {
  return (
    <React.Suspense fallback={<DashboardFiltersFallback />}>
      <DashboardFiltersInner />
    </React.Suspense>
  );
}
