'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

function parseDate(iso: string | undefined): Date | undefined {
  if (!iso) return undefined;
  return parseISO(iso);
}

function toISO(d: Date | undefined): string | undefined {
  if (!d) return undefined;
  return format(d, 'yyyy-MM-dd');
}

export function DateRangeFilter({
  from,
  to,
  onChange,
}: {
  from?: string;
  to?: string;
  onChange: (from: string | undefined, to: string | undefined) => void;
}) {
  const range: DateRange = {
    from: parseDate(from),
    to: parseDate(to),
  };

  const label = range.from
    ? range.to
      ? `${format(range.from, 'd MMM', { locale: es })} – ${format(range.to, 'd MMM', { locale: es })}`
      : format(range.from, 'd MMM yyyy', { locale: es })
    : 'Rango de fechas';

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-sm font-normal"
          />
        }
      >
        <CalendarIcon className="size-4 text-muted-foreground" />
        <span className={!range.from ? 'text-muted-foreground' : ''}>
          {label}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" side="bottom" align="start">
        <Calendar
          mode="range"
          selected={range}
          onSelect={(r) => {
            onChange(toISO(r?.from), toISO(r?.to));
          }}
          locale={es}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
