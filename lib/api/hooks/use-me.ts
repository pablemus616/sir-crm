'use client'

import { useQuery } from '@tanstack/react-query'
import { clientFetch } from '@/lib/api/client'
import type { Me } from '@/lib/auth/types'

export const ME_QUERY_KEY = ['me'] as const

export function useMe() {
  return useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: () => clientFetch<Me>('/auth/me'),
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}
