'use client';

import { useState } from 'react';
import { FilterSelect } from '@/components/dashboard/filter-select';
import { ApplicationsBoard } from '@/components/recruitment/applications-board';
import { CreateApplicationDialog } from '@/components/recruitment/create-application-dialog';
import { useList } from '@/lib/api/hooks';
import { applicationStageLabels } from '@/lib/domain/recruitment-labels';
import {
  APPLICATION_STAGES,
  type ApplicationStage,
  type Candidate,
} from '@/lib/api/types/recruitment';
import type { ApplicationFilters } from '@/lib/api/applications';
import type { Opportunity } from '@/lib/api/types/commercial';

export function ApplicationsView() {
  const [filters, setFilters] = useState<ApplicationFilters>({});
  const candidates = useList<Candidate>('candidates', { limit: 100 });
  const opportunities = useList<Opportunity>('opportunities', { limit: 100 });

  /** Combina un cambio parcial; un valor undefined limpia esa clave. */
  const patch = (next: Partial<ApplicationFilters>) =>
    setFilters((prev) => ({ ...prev, ...next }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
          Aplicaciones
        </h1>
        <CreateApplicationDialog />
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterSelect
          placeholder="Etapa"
          value={filters.stage}
          options={APPLICATION_STAGES.map((s) => ({
            value: s,
            label: applicationStageLabels[s],
          }))}
          onChange={(v) =>
            patch({ stage: v as ApplicationStage | undefined })
          }
        />
        <FilterSelect
          placeholder="Candidato"
          value={filters.candidateId}
          options={(candidates.data?.items ?? []).map((c) => ({
            value: String(c.id),
            label: `${c.firstName} ${c.lastName}`,
          }))}
          onChange={(v) =>
            patch({ candidateId: v == null ? undefined : Number(v) })
          }
        />
        <FilterSelect
          placeholder="Oportunidad"
          value={filters.opportunityId}
          options={(opportunities.data?.items ?? []).map((o) => ({
            value: String(o.id),
            label: o.title ?? `Oportunidad #${o.id}`,
          }))}
          onChange={(v) =>
            patch({ opportunityId: v == null ? undefined : Number(v) })
          }
        />
      </div>

      <ApplicationsBoard filters={filters} />
    </div>
  );
}
