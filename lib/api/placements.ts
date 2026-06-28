'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { clientFetch } from '@/lib/api/client';
import { toSpanishError } from '@/lib/api/error-message';
import type { Paginated } from '@/lib/api/types';
import type { Placement, PlacementStatus } from '@/lib/api/types/recruitment';
import type { CreatePlacementInput } from '@/lib/schemas/recruitment';

const KEY = ['placements'] as const;

export interface PlacementFilters {
  clientId?: number;
  recruiterId?: number;
  status?: PlacementStatus;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

/**
 * Lista filtrable de placements. El backend hace leftJoin de candidate +
 * opportunity como objetos. placeholderData mantiene la página previa para que
 * la tabla no parpadee al cambiar de filtro o de página.
 */
export function usePlacements(filters: PlacementFilters = {}) {
  const params: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== '') params[k] = v as string | number;
  }
  return useQuery({
    queryKey: [...KEY, filters],
    queryFn: () => clientFetch<Paginated<Placement>>('placements', { params }),
    placeholderData: (prev) => prev,
  });
}

export function usePlacement(id: number | undefined) {
  return useQuery({
    queryKey: [...KEY, 'one', id],
    queryFn: () => clientFetch<Placement>(`placements/${id}`),
    enabled: id !== undefined && id !== null,
  });
}

/**
 * Registra un placement desde una aplicación. El backend tiene efectos
 * laterales fuertes a partir de SOLO el applicationId + Bearer:
 *  - sella placedByEmployeeId desde el token;
 *  - deriva candidateId/opportunityId de la aplicación;
 *  - fuerza la etapa de la aplicación a 'hired';
 *  - si los placements activos alcanzan el headcount, marca la oportunidad
 *    como ganada.
 * Por eso el cliente NO envía candidateId/opportunityId/placedByEmployeeId y
 * onSuccess invalida las TRES claves afectadas: placements, opportunities y
 * applications.
 */
export function useCreatePlacement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePlacementInput) =>
      clientFetch<Placement>('placements', { method: 'POST', body: input }),
    onSuccess: () => {
      toast.success('Placement registrado — puede cerrar la oportunidad por headcount');
      qc.invalidateQueries({ queryKey: ['placements'] });
      qc.invalidateQueries({ queryKey: ['opportunities'] });
      qc.invalidateQueries({ queryKey: ['applications'] });
    },
    onError: (e) => toast.error(toSpanishError(e, 'No se pudo registrar el placement')),
  });
}
