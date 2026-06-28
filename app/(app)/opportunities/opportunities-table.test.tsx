import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { Opportunity } from '@/lib/api/types/commercial';

const mockOpp: Opportunity = {
  id: 1,
  clientId: 10,
  client: { id: 10, name: 'Acme S.A.' },
  responsibleEmployeeId: 5,
  responsibleEmployee: { id: 5, firstName: 'Ana', lastName: 'López' },
  pipelineStageId: 2,
  pipelineStage: { id: 2, name: 'Propuesta', sortOrder: 2, probability: 50, isWon: false, isLost: false, active: true },
  headcount: 1,
  probability: 50,
  currency: 'GTQ',
  status: 'open',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

const pagedOne = { items: [mockOpp], total: 1, page: 1, limit: 20 };
const pagedEmpty = { items: [], total: 0, page: 1, limit: 100 };

vi.mock('@/lib/api/hooks', () => ({
  useList: (_resource: string) => ({ data: pagedEmpty, isLoading: false, isError: false }),
}));

// Override for opportunities resource to return one row
vi.mock('@/lib/api/hooks', () => {
  return {
    useList: (resource: string) => {
      if (resource === 'opportunities') return { data: pagedOne, isLoading: false, isError: false };
      return { data: pagedEmpty, isLoading: false, isError: false };
    },
  };
});

vi.mock('@/lib/api/opportunities', () => ({
  useUpdateOpportunity: () => ({ mutate: vi.fn(), isPending: false }),
}));

import { OpportunitiesTable } from './opportunities-table';

describe('OpportunitiesTable — row action wiring', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('onView opens the detail drawer (shows opportunity title)', () => {
    render(<OpportunitiesTable />);
    // Open the row dropdown
    fireEvent.click(screen.getByLabelText('Acciones de fila'));
    // Click "Ver"
    fireEvent.click(screen.getByText('Ver'));
    // Detail drawer title should be visible
    expect(screen.getByText('Detalle de oportunidad')).toBeInTheDocument();
  });

  it('onEdit opens the edit dialog (shows "Editar oportunidad")', () => {
    render(<OpportunitiesTable />);
    fireEvent.click(screen.getByLabelText('Acciones de fila'));
    fireEvent.click(screen.getByText('Editar'));
    expect(screen.getByText('Editar oportunidad')).toBeInTheDocument();
  });
});
