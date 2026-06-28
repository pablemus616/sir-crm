import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { OpportunityCard } from './opportunity-card';
import type { Opportunity } from '@/lib/api/types/commercial';

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

  it('resalta el seguimiento vencido con clase destructive', () => {
    const pastDate = new Date(Date.now() - 86_400_000).toISOString();
    const overdueOpp: Opportunity = { ...opp, nextFollowUpAt: pastDate };
    render(
      <DndContext>
        <OpportunityCard opp={overdueOpp} onAction={() => {}} />
      </DndContext>,
    );
    // The badge wrapping the follow-up date should have the destructive class
    const dateBadge = screen
      .getAllByRole('generic')
      .find((el) => el.className.includes('text-destructive'));
    expect(dateBadge).toBeDefined();
  });
});
