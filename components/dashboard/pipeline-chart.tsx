'use client';

import { usePipeline } from '@/lib/api/metrics';
import { useDashboardFilters } from '@/lib/dashboard/use-dashboard-filters';
import { ChartCard } from './chart-card';
import { BarMetricChart } from './bar-metric-chart';

const SERIES = [
  { key: 'count', label: 'Oportunidades' },
  { key: 'amount', label: 'Monto Q' },
] as const;

/**
 * Gráfica de pipeline por etapa — barras de cantidad y monto Q.
 * Reacts to URL filters via useDashboardFilters.
 */
export function PipelineChart() {
  const { filters } = useDashboardFilters();
  const { data, isPending, isError, error } = usePipeline(filters);

  return (
    <ChartCard
      title="Pipeline por etapa"
      isPending={isPending}
      isError={isError}
      error={error as Error | null}
      isEmpty={!isPending && !isError && (!data || data.length === 0)}
    >
      <BarMetricChart
        data={data ?? []}
        categoryKey="stageName"
        series={[...SERIES]}
      />
    </ChartCard>
  );
}
