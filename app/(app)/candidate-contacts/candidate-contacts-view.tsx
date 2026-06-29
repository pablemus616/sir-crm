'use client';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useCandidateContacts,
  type CandidateContactFilters,
} from '@/lib/api/candidate-contacts';
import { contactDirectionLabels } from '@/lib/domain/commercial-labels';
import { formatDateTime, formatDuration } from '@/lib/format';

const LIMIT = 20;

function fullName(p: {
  firstName?: string | null;
  secondName?: string | null;
  lastName?: string | null;
  surName?: string | null;
}): string {
  return [p.firstName, p.secondName, p.lastName, p.surName].filter(Boolean).join(' ');
}

export function CandidateContactsView() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Omit<CandidateContactFilters, 'page' | 'limit'>>({});

  const q = useCandidateContacts({ ...filters, page, limit: LIMIT });

  const items = q.data?.items ?? [];
  const total = q.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
          Interacciones con candidatos
        </h1>
      </div>

      {/* Filter panel */}
      <div className="grid grid-cols-1 gap-3 rounded-md border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <Label htmlFor="f-from">Desde</Label>
          <Input
            id="f-from"
            type="date"
            value={filters.from ?? ''}
            onChange={(e) => {
              const v = e.target.value;
              setPage(1);
              setFilters((f) => ({ ...f, from: v || undefined }));
            }}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="f-to">Hasta</Label>
          <Input
            id="f-to"
            type="date"
            value={filters.to ?? ''}
            onChange={(e) => {
              const v = e.target.value;
              setPage(1);
              setFilters((f) => ({ ...f, to: v || undefined }));
            }}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="f-candidate">ID Candidato</Label>
          <Input
            id="f-candidate"
            type="number"
            min={1}
            placeholder="Ej. 42"
            value={filters.candidateId ?? ''}
            onChange={(e) => {
              const v = e.target.value;
              setPage(1);
              setFilters((f) => ({ ...f, candidateId: v ? Number(v) : undefined }));
            }}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="f-opportunity">ID Oportunidad</Label>
          <Input
            id="f-opportunity"
            type="number"
            min={1}
            placeholder="Ej. 7"
            value={filters.opportunityId ?? ''}
            onChange={(e) => {
              const v = e.target.value;
              setPage(1);
              setFilters((f) => ({ ...f, opportunityId: v ? Number(v) : undefined }));
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidato</TableHead>
              <TableHead>Puesto / Vacante</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead>Fecha / Hora</TableHead>
              <TableHead>Reclutador</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead>Notas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {q.isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : q.isError ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-sm text-destructive">
                  No se pudo cargar las interacciones.
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">
                  Sin registros.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.candidate
                      ? fullName(item.candidate)
                      : `Candidato #${item.candidateId}`}
                  </TableCell>
                  <TableCell>
                    {item.opportunity
                      ? (item.opportunity.title ?? `Vacante #${item.opportunity.id}`)
                      : item.opportunityId
                        ? `Vacante #${item.opportunityId}`
                        : '—'}
                  </TableCell>
                  <TableCell>
                    {item.contactType?.name ? (
                      <Badge variant="secondary">{item.contactType.name}</Badge>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>
                    {item.direction ? (
                      <Badge variant="outline">
                        {contactDirectionLabels[item.direction]}
                      </Badge>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm">
                    {formatDateTime(item.contactTime)}
                  </TableCell>
                  <TableCell>
                    {item.recruiter
                      ? fullName(item.recruiter)
                      : `Reclutador #${item.recruiterEmployeeId}`}
                  </TableCell>
                  <TableCell className="text-sm">
                    {item.callLength != null ? formatDuration(item.callLength) : '—'}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                    {item.contactDesc ?? '—'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {total} resultado(s) · Página {page} de {pageCount}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={page >= pageCount}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
