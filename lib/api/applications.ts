'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { clientFetch } from '@/lib/api/client';
import { toSpanishError } from '@/lib/api/error-message';
import type { Paginated } from '@/lib/api/types';
import type { Application, ApplicationStage } from '@/lib/api/types/recruitment';
import type {
  CreateApplicationInput,
  ChangeApplicationStageInput,
} from '@/lib/schemas/recruitment';

const KEY = ['applications'] as const;

export interface ApplicationFilters {
  opportunityId?: number;
  candidateId?: number;
  stage?: ApplicationStage;
  page?: number;
  limit?: number;
}

/** Lista filtrable de aplicaciones. El backend hace leftJoin de candidate + opportunity. */
export function useApplications(filters: ApplicationFilters = {}) {
  const params: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== '') params[k] = v as string | number;
  }
  return useQuery({
    queryKey: [...KEY, filters],
    queryFn: () => clientFetch<Paginated<Application>>('applications', { params }),
    placeholderData: (prev) => prev,
  });
}

export function useApplication(id: number | undefined) {
  return useQuery({
    queryKey: [...KEY, 'one', id],
    queryFn: () => clientFetch<Application>(`applications/${id}`),
    enabled: id !== undefined && id !== null,
  });
}

/**
 * Crea una aplicación. El backend impone unicidad (candidateId, opportunityId)
 * y responde 409 con un mensaje; clientFetch lo lanza como ApiError(message),
 * que se reenvía al toast.
 */
export function useCreateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateApplicationInput) =>
      clientFetch<Application>('applications', { method: 'POST', body: input }),
    onSuccess: () => {
      toast.success('Aplicación creada');
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: (e) => toast.error(toSpanishError(e, 'No se pudo crear la aplicación')),
  });
}

/**
 * Aplica una etapa nueva a la entrada con `id` dentro de cualquier dato cacheado
 * bajo la clave ['applications', ...] — sea una lista paginada o un detalle.
 */
function patchApplicationStage(
  old: unknown,
  id: number,
  stage: ApplicationStage,
): unknown {
  if (!old || typeof old !== 'object') return old;
  if ('items' in old && Array.isArray((old as Paginated<Application>).items)) {
    const page = old as Paginated<Application>;
    return {
      ...page,
      items: page.items.map((a) => (a.id === id ? { ...a, stage } : a)),
    };
  }
  if ('id' in old && (old as Application).id === id) {
    return { ...(old as Application), stage };
  }
  return old;
}

/**
 * Cambia la etapa de una aplicación (PATCH /applications/:id/stage). El backend
 * valida la transición contra su máquina de estados y responde 400 si es ilegal;
 * el front solo debe ofrecer las etapas permitidas (allowedNextStages).
 *
 * Actualización optimista: la tarjeta salta de columna de inmediato; ante un
 * error se revierte el snapshot y al asentarse se invalida para reconciliar.
 */
export function useChangeApplicationStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: number } & ChangeApplicationStageInput) =>
      clientFetch<Application>(`applications/${id}/stage`, {
        method: 'PATCH',
        body,
      }),
    onMutate: async ({ id, stage }) => {
      await qc.cancelQueries({ queryKey: KEY });
      const snapshot = qc.getQueriesData({ queryKey: KEY });
      qc.setQueriesData({ queryKey: KEY }, (old: unknown) =>
        patchApplicationStage(old, id, stage),
      );
      return { snapshot };
    },
    onSuccess: () => {
      toast.success('Etapa actualizada');
    },
    onError: (e, _vars, ctx) => {
      ctx?.snapshot.forEach(([key, data]) => qc.setQueryData(key, data));
      toast.error(toSpanishError(e, 'No se pudo cambiar la etapa'));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
}
