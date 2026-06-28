'use client';

import { useContacts } from '@/lib/api/metrics';
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

const SERIES = [{ key: 'count', label: 'Contactos' }] as const;

/**
 * Gráfica de contactos agrupados por tipo de contacto.
 * Reacts to URL filters via useDashboardFilters.
 */
export function ContactsChart() {
  const { filters } = useDashboardFilters();
  const { data, isPending, isError, error } = useContacts(filters);

  const grouped = data ? groupContacts(data) : [];

  return (
    <ChartCard
      title="Contactos por tipo"
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
