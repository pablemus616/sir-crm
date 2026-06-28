'use client';

import { useCommercial } from '@/lib/api/metrics';
import { useDashboardFilters } from '@/lib/dashboard/use-dashboard-filters';
import { buildKpis } from '@/lib/dashboard/kpis';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { KpiCard } from './kpi-card';

/**
 * KPI cards row — reacts to URL filters, shows skeletons while loading.
 * Must live in a 'use client' boundary because it consumes React Query hooks
 * and useDashboardFilters (which uses useSearchParams).
 */
export function KpiCards() {
  const { filters } = useDashboardFilters();
  const { data, isPending, isError, error } = useCommercial(filters);

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {(error as Error).message ?? 'Error al cargar métricas'}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
      {isPending || !data
        ? Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="mb-2 h-3 w-24" />
              <Skeleton className="h-8 w-full" />
            </Card>
          ))
        : buildKpis(data).map(({ key, ...kpiProps }) => (
            <KpiCard key={key} {...kpiProps} />
          ))}
    </div>
  );
}
