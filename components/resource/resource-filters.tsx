"use client";

import { useList } from "@/lib/api/hooks";
import { FilterSelect } from "@/components/dashboard/filter-select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { ResourceFilter } from "@/lib/resources/types";

type FilterValues = Record<string, string | number | boolean>;

/**
 * Sub-component: fetches options from an endpoint and renders a FilterSelect.
 * Isolated into its own component so `useList` is always called consistently
 * (hooks cannot be called conditionally).
 */
function DynamicSelectFilter({
  filter,
  value,
  onChange,
}: {
  filter: ResourceFilter;
  value: string | number | undefined;
  onChange: (key: string, value: string | number | undefined) => void;
}) {
  const getLabel =
    filter.optionLabel ??
    ((item: unknown) => (item as { name: string }).name);
  const getValue =
    filter.optionValue ??
    ((item: unknown) => (item as { id: number }).id);
  const query = useList<unknown>(filter.optionsEndpoint!, { limit: 100 });
  const options = (query.data?.items ?? []).map((item) => ({
    label: getLabel(item),
    value: String(getValue(item)),
  }));
  return (
    <FilterSelect
      placeholder={filter.label}
      value={value}
      options={options}
      onChange={(v) => onChange(filter.key, v)}
    />
  );
}

/**
 * Renders the filter controls declared in `config.filters` for a ResourceView.
 * Supports `select` (static options or endpoint-fetched) and `toggle` types.
 */
export function ResourceFilters({
  filters,
  values,
  onChange,
}: {
  filters: ResourceFilter[];
  values: FilterValues;
  onChange: (key: string, value: string | number | boolean | undefined) => void;
}) {
  if (!filters.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((filter) => {
        if (filter.type === "toggle") {
          const checked = Boolean(values[filter.key]);
          return (
            <div key={filter.key} className="flex items-center gap-1.5">
              <Switch
                id={`filter-toggle-${filter.key}`}
                checked={checked}
                onCheckedChange={(v) =>
                  onChange(filter.key, v ? true : undefined)
                }
              />
              <Label htmlFor={`filter-toggle-${filter.key}`}>
                {filter.label}
              </Label>
            </div>
          );
        }

        // select with dynamic options from an endpoint
        if (filter.optionsEndpoint) {
          return (
            <DynamicSelectFilter
              key={filter.key}
              filter={filter}
              value={values[filter.key] as string | number | undefined}
              onChange={onChange}
            />
          );
        }

        // select with static options
        const staticOptions = (filter.options ?? []).map((o) => ({
          label: o.label,
          value: String(o.value),
        }));
        return (
          <FilterSelect
            key={filter.key}
            placeholder={filter.label}
            value={values[filter.key] as string | number | undefined}
            options={staticOptions}
            onChange={(v) => onChange(filter.key, v)}
          />
        );
      })}
    </div>
  );
}
