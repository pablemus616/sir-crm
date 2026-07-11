'use client';

import { useCandidateInteractions } from '@/lib/api/metrics';
import { useDashboardFilters } from '@/lib/dashboard/use-dashboard-filters';
import { useList } from '@/lib/api/hooks';
import { employeeFullName } from '@/lib/format';
import type { ContactMetric } from '@/lib/api/metrics-types';
import type { Employee } from '@/lib/api/types/admin';
import { ChartCard } from './chart-card';
import { BarMetricChart } from './bar-metric-chart';

interface RankedEmployee {
  employeeName: string;
  count: number;
}

/**
 * Agrupa ContactMetric[] por empleado sumando conteos, resuelve el nombre a
 * partir del catálogo de empleados y ordena de mayor a menor (leaderboard).
 * Función pura. Los empleados sin nombre resuelto caen a "Empleado #<id>".
 */
export function rankEmployees(
  data: ContactMetric[],
  names: Map<number, string>,
): RankedEmployee[] {
  const totals = new Map<number, number>();
  for (const row of data) {
    totals.set(row.employeeId, (totals.get(row.employeeId) ?? 0) + row.count);
  }
  return Array.from(totals.entries())
    .map(([employeeId, count]) => ({
      employeeName: names.get(employeeId) ?? `Empleado #${employeeId}`,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

const SERIES = [{ key: 'count', label: 'Interacciones' }] as const;

/**
 * Leaderboard de interacciones con candidatos por empleado (reclutamiento).
 * Reacciona a los filtros de URL (rango de fechas incluido).
 */
export function InteractionsLeaderboardChart() {
  const { filters } = useDashboardFilters();
  const { data, isPending, isError, error } = useCandidateInteractions(filters);
  const employees = useList<Employee>('employees', { limit: 200 });

  const names = new Map<number, string>(
    (employees.data?.items ?? []).map((e) => [e.id, employeeFullName(e)]),
  );
  const ranked = data ? rankEmployees(data, names) : [];

  return (
    <ChartCard
      title="Interacciones por empleado"
      isPending={isPending}
      isError={isError}
      error={error as Error | null}
      isEmpty={!isPending && !isError && ranked.length === 0}
    >
      <BarMetricChart
        data={ranked}
        categoryKey="employeeName"
        series={[...SERIES]}
      />
    </ChartCard>
  );
}
