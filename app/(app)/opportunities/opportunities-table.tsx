'use client';

import { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { ResourceTable } from '@/components/resource/resource-table';
import { ResourceDetail, type DetailField } from '@/components/resource/resource-detail';
import { Badge } from '@/components/ui/badge';
import { useList } from '@/lib/api/hooks';
import { formatGTQ, formatDate } from '@/lib/format';
import {
  opportunityStatusLabels,
  opportunityStatusBadge,
} from '@/lib/domain/commercial-labels';
import { OpportunityFilters, type OppFilters } from './opportunity-filters';
import { OpportunityEditForm } from './opportunity-edit-form';
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

const detailFields: DetailField<Opportunity>[] = [
  {
    label: 'Título / Rol',
    render: (o) => o.title ?? o.client?.name ?? `#${o.id}`,
  },
  {
    label: 'Cliente',
    render: (o) => o.client?.name ?? '—',
  },
  {
    label: 'Área',
    render: (o) => o.area?.name ?? '—',
  },
  {
    label: 'Etapa',
    render: (o) => o.pipelineStage?.name ?? '—',
  },
  {
    label: 'Estado',
    render: (o) => (
      <Badge variant={opportunityStatusBadge(o.status)}>
        {opportunityStatusLabels[o.status]}
      </Badge>
    ),
  },
  {
    label: 'Monto (GTQ)',
    render: (o) => (o.amount != null ? formatGTQ(o.amount) : '—'),
  },
  {
    label: 'Probabilidad',
    render: (o) => `${o.probability}%`,
  },
  {
    label: 'Próximo seguimiento',
    render: (o) => (o.nextFollowUpAt ? formatDate(o.nextFollowUpAt) : '—'),
  },
  {
    label: 'Responsable',
    render: (o) => {
      const emp = o.responsibleEmployee;
      if (!emp) return '—';
      return [emp.firstName, emp.lastName].filter(Boolean).join(' ') || `#${emp.id}`;
    },
  },
];

export function OpportunitiesTable() {
  const [filters, setFilters] = useState<OppFilters>({});
  const [page, setPage] = useState(1);
  const [detailOpp, setDetailOpp] = useState<Opportunity | null>(null);
  const [editOpp, setEditOpp] = useState<Opportunity | null>(null);

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
        onView={(opp) => setDetailOpp(opp)}
        onEdit={(opp) => setEditOpp(opp)}
      />
      <ResourceDetail<Opportunity>
        open={!!detailOpp}
        onOpenChange={(o) => { if (!o) setDetailOpp(null); }}
        title="Detalle de oportunidad"
        row={detailOpp}
        fields={detailFields}
      />
      <OpportunityEditForm
        open={!!editOpp}
        onOpenChange={(o) => { if (!o) setEditOpp(null); }}
        opportunity={editOpp}
      />
    </div>
  );
}
