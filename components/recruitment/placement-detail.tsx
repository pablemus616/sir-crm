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
} from '@/lib/domain/recruitment-labels';
import type { Placement } from '@/lib/api/types/recruitment';

function candidateName(p: Placement): string {
  return p.candidate
    ? `${p.candidate.firstName} ${p.candidate.lastName}`
    : `Candidato #${p.candidateId}`;
}

function opportunityName(p: Placement): string {
  return p.opportunity?.title ?? `Oportunidad #${p.opportunityId}`;
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
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Detalle de placement</DrawerTitle>
        </DrawerHeader>
        <div className="space-y-4 px-4 pb-6">
          {placement && (
            <dl className="grid gap-3">
              <Row label="Candidato">{candidateName(placement)}</Row>
              <Row label="Oportunidad">{opportunityName(placement)}</Row>
              <Row label="Aplicación">{`#${placement.applicationId}`}</Row>
              <Row label="Fecha de colocación">
                {formatDate(placement.placementDate)}
              </Row>
              <Row label="Fecha de inicio">
                {placement.startDate ? formatDate(placement.startDate) : '—'}
              </Row>
              <Row label="Fecha de fin">
                {placement.endDate ? formatDate(placement.endDate) : '—'}
              </Row>
              <Row label="Motivo de fin">{placement.endReason ?? '—'}</Row>
              <Row label="Salario acordado">
                {placement.agreedSalary != null
                  ? formatGTQ(placement.agreedSalary)
                  : '—'}
              </Row>
              <Row label="Fee">
                {placement.fee != null ? formatGTQ(placement.fee) : '—'}
              </Row>
              <Row label="Estado">
                <Badge variant={placementStatusBadge(placement.status)}>
                  {placementStatusLabels[placement.status]}
                </Badge>
              </Row>
              <Row label="Registrado">{formatDate(placement.createdAt)}</Row>
            </dl>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
