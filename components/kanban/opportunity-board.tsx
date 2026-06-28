'use client';

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import {
  useKanbanOpportunities,
  useActiveStages,
  useChangeStage,
} from '@/lib/api/opportunities';
import { groupByStage } from '@/lib/kanban/move-stage';
import { KanbanColumn } from './kanban-column';
import { OpportunityCard, type CardAction } from './opportunity-card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Opportunity } from '@/lib/api/types/commercial';

interface OpportunityBoardProps {
  filters: Record<string, string | number | undefined>;
  onAction: (action: CardAction, opp: Opportunity) => void;
}

export function OpportunityBoard({ filters, onAction }: OpportunityBoardProps) {
  const stagesQ = useActiveStages();
  const oppsQ = useKanbanOpportunities(filters);
  const changeStage = useChangeStage();
  const [active, setActive] = useState<Opportunity | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  /* ── Loading state ─────────────────────────────────────────────────── */
  if (stagesQ.isLoading || oppsQ.isLoading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-4" aria-busy="true" aria-label="Cargando tablero">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-96 w-72 shrink-0 rounded-lg" />
        ))}
      </div>
    );
  }

  /* ── Error state ───────────────────────────────────────────────────── */
  if (stagesQ.isError || oppsQ.isError) {
    return (
      <p className="py-8 text-center text-sm text-destructive" role="alert">
        No se pudieron cargar las oportunidades. Recarga la página para intentar de nuevo.
      </p>
    );
  }

  const items = oppsQ.data?.items ?? [];
  const stages = stagesQ.data ?? [];
  const groups = groupByStage(items, stages);

  /* ── DnD handlers ──────────────────────────────────────────────────── */
  const onDragStart = ({ active: a }: DragStartEvent) => {
    const found = items.find((o) => o.id === a.id);
    setActive(found ?? null);
  };

  const onDragEnd = ({ active: a, over }: DragEndEvent) => {
    setActive(null);
    const oppId = Number(a.id);
    const overStageId = over?.data.current?.['stageId'] as number | undefined;
    const opp = items.find((o) => o.id === oppId);
    if (!opp || overStageId == null || overStageId === opp.pipelineStageId) return;
    const targetStage = stages.find((s) => s.id === overStageId);
    changeStage.mutate({
      id: oppId,
      pipelineStageId: overStageId,
      probability: targetStage?.probability,
    });
  };

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div
        className="flex gap-3 overflow-x-auto pb-4"
        role="list"
        aria-label="Tablero de oportunidades"
      >
        {groups.map((g) => (
          <KanbanColumn
            key={g.stage.id}
            stage={g.stage}
            cards={g.cards}
            onAction={onAction}
          />
        ))}
      </div>

      {/* Drag overlay — renders a floating clone while dragging */}
      <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
        {active ? (
          <OpportunityCard opp={active} onAction={() => {}} isOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
