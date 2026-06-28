import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/dashboard/use-dashboard-filters', () => ({
  useDashboardFilters: () => ({ filters: {} }),
}));

vi.mock('@/lib/api/metrics', () => ({
  useCommercial: () => ({
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
  }),
}));

import { KpiCards } from '../kpi-cards';

describe('KpiCards', () => {
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
});
