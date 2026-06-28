import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { KpiItem } from '@/lib/dashboard/kpis';

/**
 * Presentational KPI card — server-safe (no hooks).
 * Displays a single KPI metric with label, large value, and optional hint.
 */
export function KpiCard({ label, value, hint }: KpiItem) {
  return (
    <Card className="group/kpi relative overflow-hidden transition-shadow hover:shadow-md hover:ring-teal/40">
      {/* Teal accent strip on top */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-0.5 bg-teal transition-all duration-300 group-hover/kpi:h-1"
      />
      <CardHeader className="pb-0">
        <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-1">
        <p className="font-display text-2xl font-semibold leading-tight text-navy-dark">
          {value}
        </p>
        {hint && (
          <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
        )}
      </CardContent>
    </Card>
  );
}
