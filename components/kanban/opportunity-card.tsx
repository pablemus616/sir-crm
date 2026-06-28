'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';
import { formatGTQ, formatDate } from '@/lib/format';
import { opportunityStatusLabels, opportunityStatusBadge } from '@/lib/domain/commercial-labels';
import type { Opportunity } from '@/lib/api/types/commercial';

export type CardAction = 'win' | 'lose' | 'proposal' | 'follow-up';

interface OpportunityCardProps {
  opp: Opportunity;
  onAction: (action: CardAction, opp: Opportunity) => void;
  /** Set true when rendered inside DragOverlay — skips dnd ref/transform */
  isOverlay?: boolean;
}

export function OpportunityCard({ opp, onAction, isOverlay = false }: OpportunityCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: opp.id, data: { stageId: opp.pipelineStageId } });

  const style = isOverlay
    ? { opacity: 1 }
    : {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      };

  const overdue =
    opp.nextFollowUpAt != null && new Date(opp.nextFollowUpAt) < new Date();

  return (
    <Card
      ref={isOverlay ? undefined : setNodeRef}
      style={style}
      className="cursor-grab space-y-2 border-border bg-card p-3 shadow-sm active:cursor-grabbing"
      aria-roledescription="tarjeta arrastrable"
      {...(isOverlay ? {} : { ...attributes, ...listeners })}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {opp.title ?? `Oportunidad #${opp.id}`}
          </p>
          {opp.client?.name && (
            <p className="truncate text-xs text-muted-foreground">
              {opp.client.name}
            </p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Acciones"
            className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <MoreVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onAction('proposal', opp)}>
              Enviar propuesta
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction('follow-up', opp)}>
              Programar seguimiento
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction('win', opp)}>
              Marcar ganada
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onAction('lose', opp)}
            >
              Marcar perdida
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-wrap gap-1">
        <Badge variant={opportunityStatusBadge(opp.status)}>
          {opportunityStatusLabels[opp.status]}
        </Badge>
        {opp.amount != null && (
          <Badge variant="secondary">{formatGTQ(opp.amount)}</Badge>
        )}
        <Badge variant="outline">{opp.probability}%</Badge>
        {opp.nextFollowUpAt && (
          <Badge
            variant="outline"
            className={overdue ? 'text-destructive' : undefined}
            data-testid={overdue ? 'follow-up-overdue' : undefined}
          >
            {formatDate(opp.nextFollowUpAt)}
          </Badge>
        )}
      </div>
    </Card>
  );
}
