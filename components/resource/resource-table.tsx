"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RowActions } from "./row-actions";

export interface ResourceTableProps<T> {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  emptyMessage?: string;
}

export function ResourceTable<T>({
  columns,
  data,
  total,
  page,
  limit,
  onPageChange,
  isLoading,
  isError,
  errorMessage,
  search,
  onSearchChange,
  searchPlaceholder = "Buscar…",
  sorting,
  onSortingChange,
  onView,
  onEdit,
  onDelete,
  emptyMessage = "Sin resultados.",
}: ResourceTableProps<T>) {
  const hasRowActions = Boolean(onView || onEdit || onDelete);
  const pageCount = Math.max(1, Math.ceil(total / limit));

  const table = useReactTable({
    data,
    columns,
    state: { sorting: sorting ?? [] },
    onSortingChange: (updater) => {
      if (!onSortingChange) return;
      const next = typeof updater === "function" ? updater(sorting ?? []) : updater;
      onSortingChange(next);
    },
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount,
  });

  const colSpan = columns.length + (hasRowActions ? 1 : 0);

  return (
    <div className="space-y-4">
      {onSearchChange && (
        <Input
          value={search ?? ""}
          placeholder={searchPlaceholder}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-sm"
        />
      )}

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
                {hasRowActions && <TableHead className="w-12" />}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow data-testid="resource-table-skeleton">
                <TableCell colSpan={colSpan}>
                  <div className="space-y-2 py-2">
                    {Array.from({ length: Math.min(limit, 8) }).map((_, i) => (
                      <Skeleton key={i} className="h-9 w-full" />
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="py-10 text-center text-destructive">
                  {errorMessage ?? "Ocurrió un error al cargar los datos."}
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="py-10 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                  {hasRowActions && (
                    <TableCell className="text-right">
                      <RowActions
                        row={row.original}
                        onView={onView}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total} resultado(s) · Página {page} de {pageCount}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isLoading}
            onClick={() => onPageChange(page - 1)}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pageCount || isLoading}
            onClick={() => onPageChange(page + 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
