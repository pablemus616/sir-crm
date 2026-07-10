'use client';

import { FilterSelect } from '@/components/dashboard/filter-select';
import { useList } from '@/lib/api/hooks';
import { opportunityStatusLabels } from '@/lib/domain/commercial-labels';
import type { Client, PipelineStage, OpportunityStatus } from '@/lib/api/types/commercial';

export type OppFilters = {
  clientId?: number;
  sectorId?: number;
  areaId?: number;
  stageId?: number;
  status?: OpportunityStatus;
  responsibleEmployeeId?: number;
  followUpDue?: boolean;
};

export function OpportunityFilters({
  value,
  onChange,
}: {
  value: OppFilters;
  onChange: (next: OppFilters) => void;
}) {
  const clients = useList<Client>('clients', { limit: 1000 });
  const sectors = useList('sectors', { limit: 1000 });
  const areas = useList('position-areas', { limit: 1000 });
  const stages = useList<PipelineStage>('pipeline-stages', { limit: 1000 });
  const employees = useList<{ id: number; firstName?: string; lastName?: string }>(
    'employees',
    { limit: 1000 },
  );

  const set = (patch: Partial<OppFilters>) => onChange({ ...value, ...patch });
  const num = (v: string | undefined) => (v ? Number(v) : undefined);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <FilterSelect
        placeholder="Cliente"
        value={value.clientId}
        options={(clients.data?.items ?? []).map((c) => ({ value: String(c.id), label: c.name }))}
        onChange={(v) => set({ clientId: num(v) })}
      />
      <FilterSelect
        placeholder="Sector"
        value={value.sectorId}
        options={(sectors.data?.items ?? []).map((s) => ({ value: String(s.id), label: s.name }))}
        onChange={(v) => set({ sectorId: num(v) })}
      />
      <FilterSelect
        placeholder="Área"
        value={value.areaId}
        options={(areas.data?.items ?? []).map((a) => ({ value: String(a.id), label: a.name }))}
        onChange={(v) => set({ areaId: num(v) })}
      />
      <FilterSelect
        placeholder="Etapa"
        value={value.stageId}
        options={(stages.data?.items ?? []).map((s) => ({ value: String(s.id), label: s.name }))}
        onChange={(v) => set({ stageId: num(v) })}
      />
      <FilterSelect
        placeholder="Estado"
        value={value.status}
        options={Object.entries(opportunityStatusLabels).map(([k, l]) => ({ value: k, label: l }))}
        onChange={(v) => set({ status: (v || undefined) as OpportunityStatus | undefined })}
      />
      <FilterSelect
        placeholder="Responsable"
        value={value.responsibleEmployeeId}
        options={(employees.data?.items ?? []).map((e) => ({
          value: String(e.id),
          label: [e.firstName, e.lastName].filter(Boolean).join(' ') || `#${e.id}`,
        }))}
        onChange={(v) => set({ responsibleEmployeeId: num(v) })}
      />

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={!!value.followUpDue}
          onChange={(e) => set({ followUpDue: e.target.checked || undefined })}
        />
        Seguimiento vencido
      </label>
    </div>
  );
}
