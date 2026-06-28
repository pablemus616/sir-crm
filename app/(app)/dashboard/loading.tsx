import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

/**
 * DashboardLoading — loading.tsx del segmento /dashboard.
 *
 * Next.js muestra este componente automáticamente mientras el Server Component
 * padre (page.tsx) se está resolviendo en streaming. Replica la forma visual
 * del dashboard con skeletons para evitar layout shift.
 */
export default function DashboardLoading() {
  return (
    <section className="space-y-6 p-6">
      {/* Cabecera */}
      <div className="space-y-1">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-56" />
      </div>

      {/* Barra de filtros */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-8 w-44" />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="mb-2 h-3 w-20" />
            <Skeleton className="h-8 w-full" />
          </Card>
        ))}
      </div>

      {/* Gráficas primarias */}
      <div className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="mb-4 h-4 w-48" />
            <Skeleton className="h-72 w-full rounded-lg" />
          </Card>
        ))}
      </div>

      {/* Gráficas de dimensión */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="mb-4 h-4 w-48" />
            <Skeleton className="h-56 w-full rounded-lg" />
          </Card>
        ))}
      </div>
    </section>
  );
}
