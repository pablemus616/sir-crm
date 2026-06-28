'use client';

import { usePlacements } from '@/lib/api/metrics';
import { useDashboardFilters } from '@/lib/dashboard/use-dashboard-filters';
import type { PlacementMetric } from '@/lib/api/metrics-types';
import { ChartCard } from './chart-card';
import { BarMetricChart } from './bar-metric-chart';

interface GroupedPlacement {
  recruiterLabel: string;
  count: number;
  totalFee: number;
}

/** Agrupa PlacementMetric[] por reclutador, sumando colocaciones y honorarios. Función pura. */
export function groupPlacements(data: PlacementMetric[]): GroupedPlacement[] {
  const map = new Map<number, GroupedPlacement>();
  for (const row of data) {
    const existing = map.get(row.recruiterId);
    if (existing) {
      existing.count += row.count;
      existing.totalFee += row.totalFee;
    } else {
      map.set(row.recruiterId, {
        recruiterLabel: `Reclutador ${row.recruiterId}`,
        count: row.count,
        totalFee: row.totalFee,
      });
    }
  }
  return Array.from(map.values());
}

const SERIES = [
  { key: 'count', label: 'Colocaciones' },
  { key: 'totalFee', label: 'Honorarios Q' },
] as const;

/**
 * Gráfica de colocaciones agrupadas por reclutador.
 * Reacts to URL filters via useDashboardFilters.
 */
export function PlacementsChart() {
  const { filters } = useDashboardFilters();
  const { data, isPending, isError, error } = usePlacements(filters);

  const grouped = data ? groupPlacements(data) : [];

  return (
    <ChartCard
      title="Colocaciones por reclutador"
      isPending={isPending}
      isError={isError}
      error={error as Error | null}
      isEmpty={!isPending && !isError && grouped.length === 0}
    >
      <BarMetricChart
        data={grouped}
        categoryKey="recruiterLabel"
        series={[...SERIES]}
      />
    </ChartCard>
  );
}
