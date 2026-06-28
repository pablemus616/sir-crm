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

vi.mock('@/lib/api/metrics', () => ({
  usePipeline: vi.fn(),
}));

vi.mock('@/lib/dashboard/use-dashboard-filters', () => ({
  useDashboardFilters: vi.fn(() => ({ filters: {} })),
}));

import { usePipeline } from '@/lib/api/metrics';
import { PipelineChart } from '../pipeline-chart';

const mockPipeline = vi.mocked(usePipeline);

describe('PipelineChart', () => {
  it('muestra skeleton mientras carga', () => {
    mockPipeline.mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
      error: null,
    } as ReturnType<typeof usePipeline>);

    const { container } = render(<PipelineChart />);
    // ChartCard muestra skeleton (div) en lugar del SVG
    expect(container.querySelector('[data-slot="card"]')).toBeTruthy();
  });

  it('muestra mensaje de estado vacío cuando no hay datos', () => {
    mockPipeline.mockReturnValue({
      data: [],
      isPending: false,
      isError: false,
      error: null,
    } as ReturnType<typeof usePipeline>);

    const { getByText } = render(<PipelineChart />);
    expect(getByText(/sin datos/i)).toBeTruthy();
  });

  it('renderiza el SVG con datos de ambas series (count y amount)', () => {
    mockPipeline.mockReturnValue({
      data: [
        { stageId: 1, stageName: 'Prospecto', sortOrder: 1, count: 4, amount: 8000 },
        { stageId: 2, stageName: 'Propuesta', sortOrder: 2, count: 2, amount: 50000 },
      ],
      isPending: false,
      isError: false,
      error: null,
    } as ReturnType<typeof usePipeline>);

    const { container } = render(<PipelineChart />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('renderiza el mensaje de error cuando el hook falla', () => {
    mockPipeline.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      error: new Error('Error de prueba'),
    } as ReturnType<typeof usePipeline>);

    const { getByText } = render(<PipelineChart />);
    expect(getByText(/Error de prueba/i)).toBeTruthy();
  });

  it('inyecta tokens de marca --chart-1 y --chart-2 en el style del contenedor', () => {
    mockPipeline.mockReturnValue({
      data: [{ stageId: 1, stageName: 'Lead', sortOrder: 1, count: 5, amount: 1000 }],
      isPending: false,
      isError: false,
      error: null,
    } as ReturnType<typeof usePipeline>);

    const { container } = render(<PipelineChart />);
    const styleTag = container.querySelector('style');
    expect(styleTag?.textContent).toContain('--color-count');
    expect(styleTag?.textContent).toContain('--color-amount');
    expect(styleTag?.textContent).toContain('hsl(var(--chart-1))');
    expect(styleTag?.textContent).toContain('hsl(var(--chart-2))');
  });
});
