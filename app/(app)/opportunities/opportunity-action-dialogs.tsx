'use client';

// TODO Task 5.4: implement win / lose / proposal / follow-up dialogs

import type { CardAction } from '@/components/kanban/opportunity-card';
import type { Opportunity } from '@/lib/api/types/commercial';

export interface ActionState {
  action: CardAction;
  opp: Opportunity;
}

export function OpportunityActionDialogs({
  state: _state,
  onClose: _onClose,
}: {
  state: ActionState | null;
  onClose: () => void;
}) {
  return null;
}
