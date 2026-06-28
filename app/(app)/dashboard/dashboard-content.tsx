'use client';

import { DashboardFilters } from '@/components/dashboard/dashboard-filters';
import { KpiCards } from '@/components/dashboard/kpi-cards';
import { PipelineChart } from '@/components/dashboard/pipeline-chart';
import { DimensionCharts } from '@/components/dashboard/dimension-charts';
import { ContactsChart } from '@/components/dashboard/contacts-chart';
import { RecruitmentFunnelChart } from '@/components/dashboard/recruitment-funnel-chart';
import { PlacementsChart } from '@/components/dashboard/placements-chart';

/**
 * DashboardContent — composición cliente completa del dashboard.
 *
 * Todos los componentes hijos (filtros, KPIs, gráficas) leen los filtros
 * desde la URL vía `useDashboardFilters` / `useSearchParams`. Al ser este
 * componente cliente y estar envuelto en <Suspense> en el Server Component
 * padre, Next.js no aplica el CSR-bailout de prerender.
 */
export function DashboardContent() {
  return (
    <div className="flex flex-col gap-6">
      {/* Barra de filtros — tiene su propio <Suspense> interno */}
      <DashboardFilters />

      {/* Fila de KPIs — reacciona a los filtros de URL */}
      <KpiCards />

      {/* Gráficas primarias — 2 columnas en xl */}
      <div className="grid gap-6 xl:grid-cols-2">
        <PipelineChart />
        <RecruitmentFunnelChart />
        <ContactsChart />
        <PlacementsChart />
      </div>

      {/* Gráficas de dimensión — por cliente, sector y área */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <DimensionCharts />
      </div>
    </div>
  );
}
