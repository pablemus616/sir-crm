'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { usePlacements, type PlacementFilters } from '@/lib/api/placements';
import {
  placementStatusLabels,
  placementStatusBadge,
} from '@/lib/domain/recruitment-labels';
import { formatGTQ, formatDate } from '@/lib/format';
import type { Placement } from '@/lib/api/types/recruitment';
import { PlacementDetail } from './placement-detail';

function candidateName(p: Placement): string {
  return p.candidate
    ? `${p.candidate.firstName} ${p.candidate.lastName}`
    : `Candidato #${p.candidateId}`;
}

function opportunityName(p: Placement): string {
  return p.opportunity?.title ?? `Oportunidad #${p.opportunityId}`;
}

const COLUMNS = ['Candidato', 'Oportunidad', 'Fecha colocación', 'Salario', 'Fee', 'Estado'];

export function PlacementsTable({ filters }: { filters: PlacementFilters }) {
  const { data, isLoading, isError } = usePlacements(filters);
  const [detail, setDetail] = useState<Placement | null>(null);

  const items = data?.items ?? [];

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            {COLUMNS.map((c) => (
              <TableHead key={c}>{c}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {COLUMNS.map((c) => (
                  <TableCell key={c}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : isError ? (
            <TableRow>
              <TableCell
                colSpan={COLUMNS.length}
                className="py-8 text-center text-sm text-destructive"
              >
                No se pudieron cargar los placements.
              </TableCell>
            </TableRow>
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={COLUMNS.length}
                className="py-8 text-center text-sm text-muted-foreground"
              >
                No hay placements.
              </TableCell>
            </TableRow>
          ) : (
            items.map((p) => (
              <TableRow
                key={p.id}
                className="cursor-pointer"
                onClick={() => setDetail(p)}
              >
                <TableCell className="font-medium text-foreground">
                  {candidateName(p)}
                </TableCell>
                <TableCell>{opportunityName(p)}</TableCell>
                <TableCell>{formatDate(p.placementDate)}</TableCell>
                <TableCell>
                  {p.agreedSalary != null ? formatGTQ(p.agreedSalary) : '—'}
                </TableCell>
                <TableCell>{p.fee != null ? formatGTQ(p.fee) : '—'}</TableCell>
                <TableCell>
                  <Badge variant={placementStatusBadge(p.status)}>
                    {placementStatusLabels[p.status]}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <PlacementDetail
        placement={detail}
        open={!!detail}
        onOpenChange={(o) => {
          if (!o) setDetail(null);
        }}
      />
    </>
  );
}
