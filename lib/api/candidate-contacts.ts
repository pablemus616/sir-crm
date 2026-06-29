'use client';
import { useQuery } from '@tanstack/react-query';
import { clientFetch } from '@/lib/api/client';
import type { Paginated } from '@/lib/api/types';
import type { CandidateContact } from '@/lib/api/types/recruitment';

const KEY = ['candidate-contacts'] as const;

export type CandidateContactFilters = {
  candidateId?: number;
  opportunityId?: number;
  recruiterId?: number;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};

export function useCandidateContacts(filters: CandidateContactFilters = {}) {
  const params: Record<string, string | number | boolean> = { limit: filters.limit ?? 20 };
  if (filters.page) params['page'] = filters.page;
  for (const key of ['candidateId', 'opportunityId', 'recruiterId', 'from', 'to'] as const) {
    const value = filters[key];
    if (value !== undefined && value !== '') params[key] = value;
  }
  return useQuery({
    queryKey: [...KEY, filters],
    queryFn: () =>
      clientFetch<Paginated<CandidateContact>>('candidate-contacts', { params }),
    placeholderData: (prev) => prev,
  });
}
