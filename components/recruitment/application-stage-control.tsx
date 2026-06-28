'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useChangeApplicationStage } from '@/lib/api/applications';
import {
  allowedNextStages,
  applicationStageBadge,
  applicationStageLabels,
} from '@/lib/domain/recruitment-labels';
import type { ApplicationStage } from '@/lib/api/types/recruitment';

/**
 * Etiqueta de etapa + control de movimiento legal.
 *
 * La máquina de etapas es validada por el backend (PATCH .../stage responde 400
 * ante una transición ilegal). Por eso este control SOLO ofrece las etapas
 * permitidas por `allowedNextStages`; las etapas terminales (contratado,
 * rechazado, retirado) no muestran acción de movimiento.
 */
export function ApplicationStageControl({
  id,
  stage,
}: {
  id: number;
  stage: ApplicationStage;
}) {
  const mutation = useChangeApplicationStage();
  const nextStages = allowedNextStages(stage);

  return (
    <div className="flex items-center justify-between gap-2">
      <Badge variant={applicationStageBadge(stage)}>
        {applicationStageLabels[stage]}
      </Badge>

      {nextStages.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button size="sm" variant="outline" disabled={mutation.isPending}>
                Mover etapa
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            {nextStages.map((next) => (
              <DropdownMenuItem
                key={next}
                onClick={() => mutation.mutate({ id, stage: next })}
              >
                {applicationStageLabels[next]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
