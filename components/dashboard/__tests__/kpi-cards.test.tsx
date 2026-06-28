import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { UseQueryResult } from '@tanstack/react-query';
import type { CommercialMetrics } from '@/lib/api/metrics-types';

vi.mock('@/lib/dashboard/use-dashboard-filters', () => ({
  useDashboardFilters: () => ({ filters: {} }),
}));

vi.mock('@/lib/api/metrics');

import { KpiCards } from '../kpi-cards';
import * as metricsModule from '@/lib/api/metrics';

const mockUseCommercial = vi.mocked(metricsModule.useCommercial);

describe('KpiCards', () => {
  beforeEach(() => {
    mockUseCommercial.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        totalOpportunities: 10,
        totalWon: 4,
        conversionWonTotal: 0.4,
        conversionWonProposals: 0.5,
        proposalsSent: 8,
        proposalsAmount: 5000,
        wonValue: 120000,
        weightedValue: 30000,
      },
    } as any);
  });

  it('muestra los KPIs comerciales', () => {
    render(<KpiCards />);
    expect(screen.getByText('Conversión')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
    expect(screen.getByText('Quetzales ganados')).toBeInTheDocument();
  });

  it('muestra todos los labels de KPIs', () => {
    render(<KpiCards />);
    expect(screen.getByText('Oportunidades')).toBeInTheDocument();
    expect(screen.getByText('Ventas ganadas')).toBeInTheDocument();
    expect(screen.getByText('Propuestas enviadas')).toBeInTheDocument();
    expect(screen.getByText('Forecast ponderado')).toBeInTheDocument();
  });

  it('muestra skeleton cards mientras carga', () => {
    mockUseCommercial.mockReturnValue({
      isPending: true,
      isError: false,
      data: undefined,
    } as unknown as UseQueryResult<CommercialMetrics, Error>);

    render(<KpiCards />);
    expect(screen.getByTestId('kpi-cards-skeleton')).toBeInTheDocument();
    expect(screen.queryByText('Oportunidades')).not.toBeInTheDocument();
    expect(screen.queryByText('40%')).not.toBeInTheDocument();
  });

  it('muestra mensaje de error cuando falla la carga', () => {
    mockUseCommercial.mockReturnValue({
      isPending: false,
      isError: true,
      error: new Error('Error al cargar métricas'),
      data: undefined,
    } as unknown as UseQueryResult<CommercialMetrics, Error>);

    render(<KpiCards />);
    expect(screen.getByText('Error al cargar métricas')).toBeInTheDocument();
    expect(screen.queryByText('Oportunidades')).not.toBeInTheDocument();
  });
});
