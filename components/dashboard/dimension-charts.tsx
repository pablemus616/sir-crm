'use client';

import { useChartByClient, useChartBySector, useChartByArea } from '@/lib/api/metrics';
import { useDashboardFilters } from '@/lib/dashboard/use-dashboard-filters';
import { ChartCard } from './chart-card';
import { BarMetricChart } from './bar-metric-chart';
import type { ChartDatum } from '@/lib/api/metrics-types';

const OPPORTUNITY_SERIES = [
  { key: 'opportunities', label: 'Oportunidades' },
  { key: 'won', label: 'Ganadas' },
] as const;

interface DimensionChartProps {
  title: string;
  data: ChartDatum[] | undefined;
  isPending: boolean;
  isError: boolean;
  error: unknown;
  categoryKey: string;
}

function DimensionChart({
  title,
  data,
  isPending,
  isError,
  error,
  categoryKey,
}: DimensionChartProps) {
  return (
    <ChartCard
      title={title}
      isPending={isPending}
      isError={isError}
      error={error as Error | null}
      isEmpty={!isPending && !isError && (!data || data.length === 0)}
    >
      <BarMetricChart
        data={data ?? []}
        categoryKey={categoryKey}
        series={[...OPPORTUNITY_SERIES]}
      />
    </ChartCard>
  );
}

/**
 * Tres gráficas de dimensión: por cliente, por sector y por área.
 * Todas reaccionan a los filtros del dashboard.
 */
export function DimensionCharts() {
  const { filters } = useDashboardFilters();

  const byClient = useChartByClient(filters);
  const bySector = useChartBySector(filters);
  const byArea = useChartByArea(filters);

  return (
    <>
      <DimensionChart
        title="Oportunidades por cliente"
        data={byClient.data}
        isPending={byClient.isPending}
        isError={byClient.isError}
        error={byClient.error}
        categoryKey="clientName"
      />
      <DimensionChart
        title="Oportunidades por sector"
        data={bySector.data}
        isPending={bySector.isPending}
        isError={bySector.isError}
        error={bySector.error}
        categoryKey="sectorName"
      />
      <DimensionChart
        title="Oportunidades por área"
        data={byArea.data}
        isPending={byArea.isPending}
        isError={byArea.isError}
        error={byArea.error}
        categoryKey="areaName"
      />
    </>
  );
}
