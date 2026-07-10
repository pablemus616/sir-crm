'use client';

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

export interface BarSeries {
  key: string;
  label: string;
}

/**
 * Maps a 0-based index to a categorical chart token (cycles through --chart-1..8).
 * Tokens hold complete color values, so they are referenced unwrapped — wrapping
 * them again as `hsl(var(--chart-N))` yields invalid CSS and bars fall back to black.
 */
function chartColor(i: number): string {
  return `var(--chart-${(i % 8) + 1})`;
}

/**
 * Generic vertical bar chart built on shadcn ChartContainer + Recharts.
 * Colors are wired exclusively via brand CSS tokens (--chart-1..8); no hex.
 * With a single series each bar is colored by its category for readability;
 * with multiple series each series gets its own token.
 * `data` accepts any array — Recharts reads fields by string key at runtime.
 */
export function BarMetricChart({
  data,
  categoryKey,
  series,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  categoryKey: string;
  series: BarSeries[];
}) {
  const config: ChartConfig = Object.fromEntries(
    series.map((s, i) => [s.key, { label: s.label, color: chartColor(i) }]),
  );

  return (
    <ChartContainer config={config} className="h-64 w-full">
      <BarChart data={data} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey={categoryKey}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
        />
        <YAxis tickLine={false} axisLine={false} width={40} tick={{ fontSize: 11 }} />
        <ChartTooltip content={<ChartTooltipContent />} />
        {series.length === 1 ? (
          // Serie única: colorea cada barra por categoría para dar variedad y legibilidad.
          <Bar dataKey={series[0].key} radius={4}>
            {data.map((_, i) => (
              <Cell key={i} fill={chartColor(i)} />
            ))}
          </Bar>
        ) : (
          series.map((s) => (
            <Bar key={s.key} dataKey={s.key} fill={`var(--color-${s.key})`} radius={4} />
          ))
        )}
      </BarChart>
    </ChartContainer>
  );
}
