import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

/**
 * jsdom tiene dimensiones cero, por lo que Recharts no renderiza SVG por defecto.
 * Mockeamos ResponsiveContainer (tamaño fijo) y BarChart (SVG mínimo) para
 * verificar que el árbol de componentes monta sin lanzar errores.
 */
vi.mock('recharts', async (orig) => {
  const actual = await orig<typeof import('recharts')>();
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 600, height: 300 }}>{children}</div>
    ),
    BarChart: ({ children }: { children: React.ReactNode }) => (
      <svg role="img" aria-label="bar-chart">
        <g>{children}</g>
      </svg>
    ),
  };
});

import { BarMetricChart } from '../bar-metric-chart';

describe('BarMetricChart', () => {
  it('renderiza sin errores con datos', () => {
    const { container } = render(
      <BarMetricChart
        data={[{ stageName: 'Lead', count: 5 }]}
        categoryKey="stageName"
        series={[{ key: 'count', label: 'Oportunidades' }]}
      />,
    );
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('renderiza múltiples series con tokens de marca', () => {
    const { container } = render(
      <BarMetricChart
        data={[
          { stageName: 'Lead', count: 5, amount: 1000 },
          { stageName: 'Propuesta', count: 3, amount: 500 },
        ]}
        categoryKey="stageName"
        series={[
          { key: 'count', label: 'Oportunidades' },
          { key: 'amount', label: 'Monto Q' },
        ]}
      />,
    );
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('inyecta tokens de color de marca en el estilo del contenedor', () => {
    const { container } = render(
      <BarMetricChart
        data={[{ stageName: 'Lead', count: 5 }]}
        categoryKey="stageName"
        series={[{ key: 'count', label: 'Oportunidades' }]}
      />,
    );
    const styleTag = container.querySelector('style');
    expect(styleTag?.textContent).toContain('--color-count');
    expect(styleTag?.textContent).toContain('hsl(var(--chart-1))');
  });

  it('renderiza sin datos sin lanzar error', () => {
    const { container } = render(
      <BarMetricChart
        data={[]}
        categoryKey="stageName"
        series={[{ key: 'count', label: 'Oportunidades' }]}
      />,
    );
    expect(container.querySelector('svg')).toBeTruthy();
  });
});
