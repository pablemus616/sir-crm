'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { clientFetch } from '@/lib/api/client';
import type { Paginated } from '@/lib/api/types';
import type { ContactRequest } from '@/lib/api/types/commercial';
import type { HandleContactRequestInput } from '@/lib/schemas/commercial';

const KEY = ['contact-requests'] as const;

export function useContactRequests(wasHandled?: boolean) {
  const params: Record<string, string | number | boolean> = { limit: 50 };
  if (wasHandled !== undefined) params.wasHandled = wasHandled;
  return useQuery({
    queryKey: [...KEY, { wasHandled }],
    queryFn: () => clientFetch<Paginated<ContactRequest>>('contact-requests', { params }),
  });
}

export function useHandleRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: number } & HandleContactRequestInput) =>
      clientFetch<ContactRequest>(`contact-requests/${id}/handle`, {
        method: 'PATCH',
        body,
      }),
    onSuccess: () => {
      toast.success('Solicitud atendida');
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: () => toast.error('No se pudo atender la solicitud'),
  });
}
