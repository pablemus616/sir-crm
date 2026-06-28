'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { clientFetch } from '@/lib/api/client';
import type { Paginated } from '@/lib/api/types';
import type { ContactDirection, ContactHistory } from '@/lib/api/types/commercial';
import type { CreateContactHistoryInput } from '@/lib/schemas/commercial';

const KEY = ['contact-history'] as const;

export type ContactHistoryFilters = {
  contactId?: number;
  clientId?: number;
  contactType?: number;
  opportunityId?: number;
  direction?: ContactDirection;
  from?: string;
  to?: string;
};

export function useContactHistory(filters: ContactHistoryFilters = {}) {
  const params: Record<string, string | number | boolean> = { limit: 50 };
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '') params[key] = value;
  }
  return useQuery({
    queryKey: [...KEY, filters],
    queryFn: () => clientFetch<Paginated<ContactHistory>>('contact-history', { params }),
  });
}

export function useLogContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateContactHistoryInput) =>
      clientFetch<ContactHistory>('contact-history', { method: 'POST', body: input }),
    onSuccess: () => {
      toast.success('Contacto registrado');
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: () => toast.error('No se pudo registrar el contacto'),
  });
}
