'use client';

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
  const clients = useList<Client>('clients', { limit: 100 });
  const stages = useList<PipelineStage>('pipeline-stages', { limit: 100 });

  const set = (patch: Partial<OppFilters>) => onChange({ ...value, ...patch });
  const num = (v: string) => (v ? Number(v) : undefined);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <select
        className="rounded-md border border-input bg-background p-2 text-sm"
        value={value.clientId ?? ''}
        onChange={(e) => set({ clientId: num(e.target.value) })}
      >
        <option value="">Todos los clientes</option>
        {clients.data?.items.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        className="rounded-md border border-input bg-background p-2 text-sm"
        value={value.stageId ?? ''}
        onChange={(e) => set({ stageId: num(e.target.value) })}
      >
        <option value="">Todas las etapas</option>
        {stages.data?.items.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <select
        className="rounded-md border border-input bg-background p-2 text-sm"
        value={value.status ?? ''}
        onChange={(e) =>
          set({ status: (e.target.value || undefined) as OpportunityStatus | undefined })
        }
      >
        <option value="">Todos los estados</option>
        {Object.entries(opportunityStatusLabels).map(([k, l]) => (
          <option key={k} value={k}>
            {l}
          </option>
        ))}
      </select>

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
