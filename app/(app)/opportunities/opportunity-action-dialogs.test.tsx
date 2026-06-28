import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const mutate = vi.fn();
vi.mock('@/lib/api/opportunities', () => ({
  useSendProposal: () => ({ mutate, isPending: false }),
  useFollowUp: () => ({ mutate: vi.fn(), isPending: false }),
  useWinOpportunity: () => ({ mutate: vi.fn(), isPending: false }),
  useLoseOpportunity: () => ({ mutate: vi.fn(), isPending: false }),
}));
import { OpportunityActionDialogs } from './opportunity-action-dialogs';
import type { Opportunity } from '@/lib/api/types/commercial';

const opp = { id: 7 } as Opportunity;

describe('OpportunityActionDialogs', () => {
  beforeEach(() => mutate.mockReset());
  it('envía propuesta con el monto ingresado', () => {
    render(<OpportunityActionDialogs state={{ action: 'proposal', opp }} onClose={() => {}} />);
    fireEvent.change(screen.getByLabelText('Monto (GTQ)'), { target: { value: '1200' } });
    fireEvent.click(screen.getByText('Confirmar'));
    expect(mutate).toHaveBeenCalledWith({ id: 7, amount: 1200 }, expect.any(Object));
  });
});
