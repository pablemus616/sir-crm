"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

export interface ComboboxOption {
  label: string
  value: string
  disabled?: boolean
}

export interface ComboboxProps {
  options: ComboboxOption[]
  /** Selected value (compared as string). */
  value: string | number | null | undefined
  onChange: (value: string | undefined) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  /** When true, adds a first item that clears the selection (e.g. filters: "todos"). */
  clearable?: boolean
  clearLabel?: string
  loading?: boolean
  disabled?: boolean
  id?: string
  triggerClassName?: string
  contentClassName?: string
  /** Disable built-in client-side filtering; pair with onSearchChange for server search. */
  filter?: boolean
  onSearchChange?: (query: string) => void
}

/**
 * Searchable single-select. Popover + cmdk Command. Unlike the base-ui Select,
 * the trigger label is derived from the matching option, so it never shows a raw
 * id, and the list is filterable by typing.
 */
export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Seleccionar…",
  searchPlaceholder = "Buscar…",
  emptyText = "Sin resultados.",
  clearable = false,
  clearLabel = "Todos",
  loading = false,
  disabled = false,
  id,
  triggerClassName,
  contentClassName,
  filter = true,
  onSearchChange,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")

  const selectedValue = value != null && value !== "" ? String(value) : ""
  const selected = options.find((o) => o.value === selectedValue)

  const triggerLabel = selected
    ? selected.label
    : loading && selectedValue
      ? "Cargando…"
      : placeholder

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) setQuery("")
  }

  function handleSearch(next: string) {
    setQuery(next)
    onSearchChange?.(next)
  }

  function pick(next: string | undefined) {
    onChange(next)
    handleOpenChange(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        id={id}
        type="button"
        disabled={disabled}
        data-slot="combobox-trigger"
        data-placeholder={selected ? undefined : ""}
        className={cn(
          "flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-placeholder:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50",
          triggerClassName,
        )}
      >
        <span className="line-clamp-1 flex-1 text-left">{triggerLabel}</span>
        <ChevronDownIcon className="pointer-events-none size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className={cn("w-(--anchor-width) min-w-[12rem] p-0", contentClassName)}
      >
        <Command shouldFilter={filter}>
          <CommandInput
            value={query}
            onValueChange={handleSearch}
            placeholder={searchPlaceholder}
            autoFocus
          />
          <CommandList>
            {loading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Cargando…
              </div>
            ) : (
              <>
                <CommandEmpty>{emptyText}</CommandEmpty>
                {clearable && (
                  <CommandItem value="__all__ todos" onSelect={() => pick(undefined)}>
                    <span className="text-muted-foreground">{clearLabel}</span>
                  </CommandItem>
                )}
                {options.map((o) => (
                  <CommandItem
                    key={o.value}
                    // Include the value so options with duplicate labels stay unique
                    // and remain searchable by id; onSelect uses the closure, not this.
                    value={`${o.label} ${o.value}`}
                    disabled={o.disabled}
                    data-checked={o.value === selectedValue ? "true" : undefined}
                    onSelect={() => pick(o.value)}
                  >
                    <span className="line-clamp-1">{o.label}</span>
                  </CommandItem>
                ))}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
