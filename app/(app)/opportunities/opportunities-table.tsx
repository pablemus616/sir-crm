'use client';

import { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { ResourceTable } from '@/components/resource/resource-table';
import { Badge } from '@/components/ui/badge';
import { useList } from '@/lib/api/hooks';
import { formatGTQ, formatDate } from '@/lib/format';
import {
  opportunityStatusLabels,
  opportunityStatusBadge,
} from '@/lib/domain/commercial-labels';
import { OpportunityFilters, type OppFilters } from './opportunity-filters';
import type { CardAction } from '@/components/kanban/opportunity-card';
import type { Opportunity } from '@/lib/api/types/commercial';

const LIMIT = 20;

const columns: ColumnDef<Opportunity>[] = [
  {
    id: 'title',
    header: 'Título / Rol',
    cell: ({ row }) =>
      row.original.title ?? row.original.client?.name ?? `#${row.original.id}`,
  },
  {
    id: 'client',
    header: 'Cliente',
    cell: ({ row }) => row.original.client?.name ?? '—',
  },
  {
    id: 'area',
    header: 'Área',
    cell: ({ row }) => row.original.area?.name ?? '—',
  },
  {
    id: 'pipelineStage',
    header: 'Etapa',
    cell: ({ row }) => row.original.pipelineStage?.name ?? '—',
  },
  {
    id: 'status',
    header: 'Estado',
    cell: ({ row }) => (
      <Badge variant={opportunityStatusBadge(row.original.status)}>
        {opportunityStatusLabels[row.original.status]}
      </Badge>
    ),
  },
  {
    id: 'amount',
    header: 'Monto',
    cell: ({ row }) =>
      row.original.amount != null ? formatGTQ(row.original.amount) : '—',
  },
  {
    id: 'probability',
    header: 'Prob.',
    cell: ({ row }) => `${row.original.probability}%`,
  },
  {
    id: 'nextFollowUpAt',
    header: 'Seguimiento',
    cell: ({ row }) =>
      row.original.nextFollowUpAt ? formatDate(row.original.nextFollowUpAt) : '—',
  },
  {
    id: 'responsibleEmployee',
    header: 'Responsable',
    cell: ({ row }) => {
      const emp = row.original.responsibleEmployee;
      if (!emp) return '—';
      return [emp.firstName, emp.lastName].filter(Boolean).join(' ') || `#${emp.id}`;
    },
  },
];

export function OpportunitiesTable({
  onAction,
}: {
  onAction: (action: CardAction, opp: Opportunity) => void;
}) {
  const [filters, setFilters] = useState<OppFilters>({});
  const [page, setPage] = useState(1);

  const q = useList<Opportunity>('opportunities', { ...filters, page, limit: LIMIT });

  const handleFiltersChange = (next: OppFilters) => {
    setFilters(next);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <OpportunityFilters value={filters} onChange={handleFiltersChange} />
      <ResourceTable<Opportunity>
        columns={columns}
        data={q.data?.items ?? []}
        total={q.data?.total ?? 0}
        page={page}
        limit={LIMIT}
        onPageChange={setPage}
        isLoading={q.isLoading}
        isError={q.isError}
        emptyMessage="No hay oportunidades con los filtros aplicados."
        onView={(opp) => onAction('proposal', opp)}
        onEdit={(opp) => onAction('follow-up', opp)}
      />
    </div>
  );
}
