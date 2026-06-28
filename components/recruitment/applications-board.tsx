'use client';

import { useApplications, type ApplicationFilters } from '@/lib/api/applications';
import { applicationStageLabels } from '@/lib/domain/recruitment-labels';
import {
  APPLICATION_STAGES,
  type Application,
  type ApplicationStage,
} from '@/lib/api/types/recruitment';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ApplicationStageControl } from './application-stage-control';

function candidateName(a: Application): string {
  return a.candidate
    ? `${a.candidate.firstName} ${a.candidate.lastName}`
    : `Candidato #${a.candidateId}`;
}

function opportunityName(a: Application): string {
  return a.opportunity?.title ?? `Oportunidad #${a.opportunityId}`;
}

export function ApplicationsBoard({ filters }: { filters: ApplicationFilters }) {
  const { data, isLoading, isError } = useApplications({ ...filters, limit: 200 });

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-4" aria-busy="true">
        {APPLICATION_STAGES.map((stage) => (
          <Skeleton key={stage} className="h-72 w-64 shrink-0 rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="py-8 text-center text-sm text-destructive" role="alert">
        No se pudieron cargar las aplicaciones. Recarga la página para intentar de
        nuevo.
      </p>
    );
  }

  const items = data?.items ?? [];
  const groups = new Map<ApplicationStage, Application[]>();
  for (const stage of APPLICATION_STAGES) groups.set(stage, []);
  for (const a of items) groups.get(a.stage)?.push(a);

  return (
    <div
      className="grid grid-flow-col auto-cols-[minmax(16rem,1fr)] gap-3 overflow-x-auto pb-4 lg:grid-flow-row lg:auto-cols-auto lg:grid-cols-4 xl:grid-cols-7"
      role="list"
      aria-label="Tablero de aplicaciones"
    >
      {APPLICATION_STAGES.map((stage) => {
        const cards = groups.get(stage) ?? [];
        return (
          <section
            key={stage}
            role="listitem"
            className="flex min-w-64 flex-col gap-2 rounded-xl bg-muted/40 p-2 lg:min-w-0"
          >
            <header className="flex items-center justify-between px-1 pt-1">
              <h2 className="font-[family-name:var(--font-display)] text-sm font-semibold text-foreground">
                {applicationStageLabels[stage]}
              </h2>
              <span className="text-xs text-muted-foreground tabular-nums">
                {cards.length}
              </span>
            </header>

            {cards.length === 0 ? (
              <p className="px-1 py-6 text-center text-xs text-muted-foreground">
                Vacío
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {cards.map((a) => (
                  <Card key={a.id} size="sm" className="gap-2 px-3">
                    <p className="truncate text-sm font-medium text-foreground">
                      {candidateName(a)}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {opportunityName(a)}
                    </p>
                    <ApplicationStageControl id={a.id} stage={a.stage} />
                  </Card>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
