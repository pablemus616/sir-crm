'use client';

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { formatGTQ, formatDate } from '@/lib/format';
import {
  placementStatusLabels,
  placementStatusBadge,
  applicationStageLabels,
} from '@/lib/domain/recruitment-labels';
import { usePlacement } from '@/lib/api/placements';
import type { Placement } from '@/lib/api/types/recruitment';

function candidateName(p: Placement): string {
  return p.candidate
    ? `${p.candidate.firstName} ${p.candidate.lastName}`
    : `Candidato #${p.candidateId}`;
}

function opportunityName(p: Placement): string {
  return p.opportunity?.title ?? `Oportunidad #${p.opportunityId}`;
}

function recruiterName(p: Placement): string {
  const ref = p.placedBy;
  const full = ref ? `${ref.firstName ?? ''} ${ref.lastName ?? ''}`.trim() : '';
  return full || `Empleado #${p.placedByEmployeeId}`;
}

function applicationSummary(p: Placement): string {
  return p.application
    ? `#${p.applicationId} · ${applicationStageLabels[p.application.stage]}`
    : `#${p.applicationId}`;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-2 border-b border-border pb-2">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="col-span-2 text-sm text-foreground">{children}</dd>
    </div>
  );
}

export function PlacementDetail({
  placement,
  open,
  onOpenChange,
}: {
  placement: Placement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  // Enriquecemos con GET /placements/:id (suma application + placedBy joins),
  // habilitado solo mientras el drawer está abierto. Hasta que resuelve usamos
  // la fila de la lista, que ya trae todos los campos escalares + candidate /
  // opportunity.
  const detail = usePlacement(open ? placement?.id : undefined);
  const data = detail.data ?? placement;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Detalle de placement</DrawerTitle>
        </DrawerHeader>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-6">
          {data && (
            <dl className="grid gap-3">
              <Row label="Candidato">{candidateName(data)}</Row>
              <Row label="Oportunidad">{opportunityName(data)}</Row>
              <Row label="Aplicación">{applicationSummary(data)}</Row>
              <Row label="Reclutador">{recruiterName(data)}</Row>
              <Row label="Fecha de colocación">
                {formatDate(data.placementDate)}
              </Row>
              <Row label="Fecha de inicio">
                {data.startDate ? formatDate(data.startDate) : '—'}
              </Row>
              <Row label="Fecha de fin">
                {data.endDate ? formatDate(data.endDate) : '—'}
              </Row>
              <Row label="Motivo de fin">{data.endReason ?? '—'}</Row>
              <Row label="Salario acordado">
                {data.agreedSalary != null ? formatGTQ(data.agreedSalary) : '—'}
              </Row>
              <Row label="Fee">
                {data.fee != null ? formatGTQ(data.fee) : '—'}
              </Row>
              <Row label="Estado">
                <Badge variant={placementStatusBadge(data.status)}>
                  {placementStatusLabels[data.status]}
                </Badge>
              </Row>
              <Row label="Registrado">{formatDate(data.createdAt)}</Row>
            </dl>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
