'use client';

import { Combobox } from '@/components/ui/combobox';

export interface FilterOption {
  value: string;
  label: string;
}

/**
 * Clearable, searchable filter dropdown. `undefined` value means "all".
 * Backed by the shared Combobox so long option lists are searchable.
 */
export function FilterSelect({
  placeholder,
  value,
  options,
  onChange,
}: {
  placeholder: string;
  value: number | string | undefined;
  options: FilterOption[];
  onChange: (value: string | undefined) => void;
}) {
  return (
    <Combobox
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      searchPlaceholder={`Buscar ${placeholder.toLowerCase()}…`}
      clearable
      clearLabel={`${placeholder}: todos`}
      triggerClassName="w-44"
    />
  );
}
