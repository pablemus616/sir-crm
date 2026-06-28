'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  type ChartConfig,
} from '@/components/ui/chart';
import { usePipeline } from '@/lib/api/metrics';
import { useDashboardFilters } from '@/lib/dashboard/use-dashboard-filters';
import { formatCompactCurrency, formatNumber } from '@/lib/format';
import { ChartCard } from './chart-card';

/**
 * PipelineChart — barras duales por etapa.
 *
 * Usa dos ejes Y independientes para que ambas series sean legibles:
 *   - Eje izquierdo (count): Oportunidades  (~1–50)
 *   - Eje derecho  (amount): Monto Q        (~1 000–1 000 000+)
 *
 * Colores exclusivamente via tokens de marca --chart-1 / --chart-2.
 */

const chartConfig = {
  count: {
    label: 'Oportunidades',
    color: 'hsl(var(--chart-1))',
  },
  amount: {
    label: 'Monto Q',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

/** Tooltip personalizado — formatea monto como GTQ compacto. */
function PipelineTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number; fill: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="grid min-w-36 gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
      <p className="font-medium">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <div className="h-2 w-2 shrink-0 rounded-[2px]" style={{ backgroundColor: entry.fill }} />
          <span className="text-muted-foreground">
            {chartConfig[entry.dataKey as keyof typeof chartConfig]?.label ?? entry.dataKey}
          </span>
          <span className="ml-auto font-mono font-medium tabular-nums">
            {entry.dataKey === 'amount'
              ? formatCompactCurrency(entry.value)
              : formatNumber(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

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
      <ChartContainer config={chartConfig} className="h-72 w-full">
        <BarChart data={data ?? []} accessibilityLayer>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="stageName"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11 }}
          />
          {/* Eje izquierdo: conteo de oportunidades */}
          <YAxis
            yAxisId="left"
            tickLine={false}
            axisLine={false}
            width={30}
            tick={{ fontSize: 11 }}
            tickFormatter={formatNumber}
          />
          {/* Eje derecho: monto en Quetzales (formato compacto) */}
          <YAxis
            yAxisId="right"
            orientation="right"
            tickLine={false}
            axisLine={false}
            width={55}
            tick={{ fontSize: 11 }}
            tickFormatter={formatCompactCurrency}
          />
          <ChartTooltip content={<PipelineTooltip />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar
            yAxisId="left"
            dataKey="count"
            fill="var(--color-count)"
            radius={4}
            name="count"
          />
          <Bar
            yAxisId="right"
            dataKey="amount"
            fill="var(--color-amount)"
            radius={4}
            name="amount"
          />
        </BarChart>
      </ChartContainer>
    </ChartCard>
  );
}
