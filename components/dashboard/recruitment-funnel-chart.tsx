'use client';

import { useRecruitmentFunnel } from '@/lib/api/metrics';
import { useDashboardFilters } from '@/lib/dashboard/use-dashboard-filters';
import { ChartCard } from './chart-card';
import { BarMetricChart } from './bar-metric-chart';

const SERIES = [{ key: 'count', label: 'Candidatos' }] as const;

/**
 * Gráfica de embudo de reclutamiento por etapa.
 * Reacts to URL filters via useDashboardFilters.
 */
export function RecruitmentFunnelChart() {
  const { filters } = useDashboardFilters();
  const { data, isPending, isError, error } = useRecruitmentFunnel(filters);

  return (
    <ChartCard
      title="Embudo de reclutamiento"
      isPending={isPending}
      isError={isError}
      error={error as Error | null}
      isEmpty={!isPending && !isError && (!data || data.length === 0)}
    >
      <BarMetricChart
        data={data ?? []}
        categoryKey="stage"
        series={[...SERIES]}
      />
    </ChartCard>
  );
}
