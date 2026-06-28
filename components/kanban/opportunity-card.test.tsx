import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { OpportunityCard } from './opportunity-card';
import type { Opportunity } from '@/lib/api/types/commercial';

// Mock useSortable so tests run without a full DnD context.
// The mock captures call args (for the stageId assertion) and returns stable values.
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: vi.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  })),
}));

const opp: Opportunity = {
  id: 1,
  title: 'Reclutador IT',
  client: { id: 2, name: 'ACME' },
  amount: 5000,
  probability: 40,
  pipelineStageId: 1,
  status: 'open',
  clientId: 2,
  responsibleEmployeeId: 1,
  headcount: 1,
  currency: 'GTQ',
  createdAt: '',
  updatedAt: '',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('OpportunityCard', () => {
  it('muestra título, monto en Q y probabilidad', () => {
    render(
      <DndContext>
        <OpportunityCard opp={opp} onAction={() => {}} />
      </DndContext>,
    );
    expect(screen.getByText('Reclutador IT')).toBeInTheDocument();
    expect(screen.getByText(/40%/)).toBeInTheDocument();
    expect(screen.getByText(/Q/)).toBeInTheDocument();
  });

  it('muestra el chip de estado en español', () => {
    render(
      <DndContext>
        <OpportunityCard opp={opp} onAction={() => {}} />
      </DndContext>,
    );
    expect(screen.getByText('Abierta')).toBeInTheDocument();
  });

  it('emite acción win desde el menú', () => {
    const onAction = vi.fn();
    render(
      <DndContext>
        <OpportunityCard opp={opp} onAction={onAction} />
      </DndContext>,
    );
    fireEvent.click(screen.getByLabelText('Acciones'));
    fireEvent.click(screen.getByText('Marcar ganada'));
    expect(onAction).toHaveBeenCalledWith('win', opp);
  });

  it('resalta el seguimiento vencido con data-testid follow-up-overdue', () => {
    const pastDate = new Date(Date.now() - 86_400_000).toISOString();
    const overdueOpp: Opportunity = { ...opp, nextFollowUpAt: pastDate };
    render(
      <DndContext>
        <OpportunityCard opp={overdueOpp} onAction={() => {}} />
      </DndContext>,
    );
    expect(screen.getByTestId('follow-up-overdue')).toBeInTheDocument();
  });

  it('no agrega data-testid follow-up-overdue cuando el seguimiento no está vencido', () => {
    const futureDate = new Date(Date.now() + 86_400_000).toISOString();
    const upcomingOpp: Opportunity = { ...opp, nextFollowUpAt: futureDate };
    render(
      <DndContext>
        <OpportunityCard opp={upcomingOpp} onAction={() => {}} />
      </DndContext>,
    );
    expect(screen.queryByTestId('follow-up-overdue')).toBeNull();
  });

  it('pasa stageId en el data de useSortable (guard de regresión del bug de drag)', () => {
    render(
      <DndContext>
        <OpportunityCard opp={opp} onAction={() => {}} />
      </DndContext>,
    );
    expect(vi.mocked(useSortable)).toHaveBeenCalledWith(
      expect.objectContaining({ id: opp.id, data: { stageId: opp.pipelineStageId } }),
    );
  });
});
