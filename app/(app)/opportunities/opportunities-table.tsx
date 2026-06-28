'use client';

// TODO Task 5.5: implement sortable data table for opportunities

import type { CardAction } from '@/components/kanban/opportunity-card';
import type { Opportunity } from '@/lib/api/types/commercial';

export function OpportunitiesTable({
  onAction: _onAction,
}: {
  onAction: (action: CardAction, opp: Opportunity) => void;
}) {
  return (
    <div className="flex min-h-48 items-center justify-center rounded-lg bg-muted/30 text-sm text-muted-foreground">
      Vista de tabla próximamente…
    </div>
  );
}
