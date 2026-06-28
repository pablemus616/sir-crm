'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface FilterOption {
  value: string;
  label: string;
}

const ALL = '__all__';

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
  // Base UI muestra el VALOR crudo en el trigger salvo que se le pase `items`
  // (mapa value→label) al Root; sin esto el trigger mostraba '__all__'/ids.
  const allLabel = `${placeholder}: todos`;
  const items: Record<string, string> = { [ALL]: allLabel };
  for (const o of options) items[o.value] = o.label;

  return (
    <Select
      items={items}
      value={value === undefined ? ALL : String(value)}
      onValueChange={(v) => onChange(v == null || v === ALL ? undefined : v)}
    >
      <SelectTrigger className="w-44">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
