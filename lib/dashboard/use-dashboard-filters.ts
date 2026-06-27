'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { MetricsFilters } from '@/lib/api/metrics-types';
import { filtersToSearchParams, parseFilters } from './filters';

export function useDashboardFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => parseFilters(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const apply = useCallback(
    (next: MetricsFilters) => {
      const qs = filtersToSearchParams(next).toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const setFilter = useCallback(
    <K extends keyof MetricsFilters>(key: K, value: MetricsFilters[K]) => {
      const next = { ...filters };
      if (value === undefined || value === null || (value as unknown) === '') {
        delete next[key];
      } else {
        next[key] = value;
      }
      apply(next);
    },
    [filters, apply],
  );

  const reset = useCallback(() => apply({}), [apply]);

  return { filters, setFilter, setFilters: apply, reset };
}
