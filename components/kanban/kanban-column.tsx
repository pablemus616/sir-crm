'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { OpportunityCard, type CardAction } from './opportunity-card';
import { sumColumnAmount } from '@/lib/kanban/move-stage';
import { formatCompactCurrency } from '@/lib/format';
import type { Opportunity, PipelineStage } from '@/lib/api/types/commercial';

interface KanbanColumnProps {
  stage: PipelineStage;
  cards: Opportunity[];
  onAction: (action: CardAction, opp: Opportunity) => void;
}

export function KanbanColumn({ stage, cards, onAction }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `stage-${stage.id}`,
    data: { stageId: stage.id },
  });

  return (
    <div
      ref={setNodeRef}
      role="region"
      aria-label={stage.name}
      className={[
        'flex w-full flex-col rounded-lg bg-muted/50 p-2 transition-shadow',
        isOver ? 'ring-2 ring-ring' : '',
      ].join(' ')}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-1 pb-2">
        <h3 className="text-sm font-semibold text-foreground">{stage.name}</h3>
        <span className="text-xs text-muted-foreground">
          {cards.length} · {formatCompactCurrency(sumColumnAmount(cards))}
        </span>
      </div>

      {/* Sortable card list */}
      <SortableContext
        items={cards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2 pb-1">
          {cards.map((c) => (
            <OpportunityCard key={c.id} opp={c} onAction={onAction} />
          ))}
        </div>
      </SortableContext>

      {/* Empty-state hint */}
      {cards.length === 0 && (
        <p className="py-6 text-center text-xs text-muted-foreground/60">
          Sin oportunidades
        </p>
      )}
    </div>
  );
}
