'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ChartCardProps {
  title: string;
  isPending: boolean;
  isError: boolean;
  error?: Error | null;
  isEmpty: boolean;
  children: React.ReactNode;
}

/**
 * DRY wrapper for dashboard chart cards.
 * Handles loading (skeleton), empty state, and error state uniformly.
 */
export function ChartCard({
  title,
  isPending,
  isError,
  error,
  isEmpty,
  children,
}: ChartCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <Skeleton className="h-64 w-full" />
        ) : isError ? (
          <p className="flex h-64 items-center justify-center text-sm text-destructive">
            {(error as Error | null)?.message ?? 'Error al cargar datos'}
          </p>
        ) : isEmpty ? (
          <p className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            Sin datos para los filtros seleccionados
          </p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
