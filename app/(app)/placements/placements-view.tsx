'use client';

import { useState } from 'react';
import { FilterSelect } from '@/components/dashboard/filter-select';
import { Input } from '@/components/ui/input';
import { CreatePlacementDialog } from '@/components/recruitment/create-placement-dialog';
import { PlacementsTable } from '@/components/recruitment/placements-table';
import { PLACEMENT_STATUSES, type PlacementStatus } from '@/lib/api/types/recruitment';
import { placementStatusLabels } from '@/lib/domain/recruitment-labels';
import type { PlacementFilters } from '@/lib/api/placements';

export function PlacementsView() {
  const [filters, setFilters] = useState<PlacementFilters>({});

  /** Combina un cambio parcial; un valor undefined limpia esa clave. */
  const patch = (next: Partial<PlacementFilters>) =>
    setFilters((prev) => ({ ...prev, ...next }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
          Placements
        </h1>
        <CreatePlacementDialog />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          placeholder="Estado"
          value={filters.status}
          options={PLACEMENT_STATUSES.map((s) => ({
            value: s,
            label: placementStatusLabels[s],
          }))}
          onChange={(v) => patch({ status: v as PlacementStatus | undefined })}
        />
        <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
          Desde
          <Input
            type="date"
            className="w-40"
            value={filters.from ?? ''}
            onChange={(e) => patch({ from: e.target.value || undefined })}
          />
        </label>
        <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
          Hasta
          <Input
            type="date"
            className="w-40"
            value={filters.to ?? ''}
            onChange={(e) => patch({ to: e.target.value || undefined })}
          />
        </label>
      </div>

      <PlacementsTable filters={filters} />
    </div>
  );
}
