'use client';

import { useCandidateInteractions } from '@/lib/api/metrics';
import { useDashboardFilters } from '@/lib/dashboard/use-dashboard-filters';
import type { ContactMetric } from '@/lib/api/metrics-types';
import { ChartCard } from './chart-card';
import { BarMetricChart } from './bar-metric-chart';

interface GroupedContact {
  contactTypeName: string;
  count: number;
}

/** Agrupa ContactMetric[] por tipo de contacto, sumando conteos. Función pura. */
export function groupContacts(data: ContactMetric[]): GroupedContact[] {
  const map = new Map<string, number>();
  for (const row of data) {
    const key = row.contactTypeName ?? 'Sin tipo';
    map.set(key, (map.get(key) ?? 0) + row.count);
  }
  return Array.from(map.entries()).map(([contactTypeName, count]) => ({
    contactTypeName,
    count,
  }));
}

const SERIES = [{ key: 'count', label: 'Interacciones' }] as const;

/**
 * Gráfica de interacciones con candidatos agrupadas por tipo de contacto
 * (reclutamiento), NO el historial comercial. Reacciona a los filtros de URL.
 */
export function ContactsChart() {
  const { filters } = useDashboardFilters();
  const { data, isPending, isError, error } = useCandidateInteractions(filters);

  const grouped = data ? groupContacts(data) : [];

  return (
    <ChartCard
      title="Interacciones por tipo"
      isPending={isPending}
      isError={isError}
      error={error as Error | null}
      isEmpty={!isPending && !isError && grouped.length === 0}
    >
      <BarMetricChart
        data={grouped}
        categoryKey="contactTypeName"
        series={[...SERIES]}
      />
    </ChartCard>
  );
}
