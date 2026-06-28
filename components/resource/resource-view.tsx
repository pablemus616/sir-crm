"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { TypeOf, ZodType } from "zod";
import type { SortingState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ResourceTable } from "./resource-table";
import { ResourceForm } from "./resource-form";
import { ResourceDetail } from "./resource-detail";
import { ResourceFilters } from "./resource-filters";
import type { ResourceDescriptor } from "@/lib/resources/types";
import type { ListParams } from "@/lib/api/types";

export function ResourceView<T extends { id: string | number }, S extends ZodType>({
  resource,
}: {
  resource: ResourceDescriptor<T, S>;
}) {
  const { config, hooks } = resource;
  const limit = config.defaultLimit ?? 20;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filterValues, setFilterValues] = useState<Record<string, string | number | boolean>>({});
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [detailRow, setDetailRow] = useState<T | null>(null);
  const [pendingDelete, setPendingDelete] = useState<T | null>(null);

  const params: ListParams = { page, limit };
  if (search && config.searchParam) params[config.searchParam] = search;
  if (sorting[0]) {
    params.sort = sorting[0].id;
    params.order = sorting[0].desc ? "desc" : "asc";
  }
  for (const [k, v] of Object.entries(filterValues)) {
    params[k] = v;
  }

  const list = hooks.useList(params);
  const create = hooks.useCreate();
  const update = hooks.useUpdate();
  const remove = hooks.useRemove();

  function handleFilterChange(key: string, value: string | number | boolean | undefined) {
    setPage(1);
    setFilterValues((prev) => {
      const next = { ...prev };
      if (value === undefined || value === false) {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
  }

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(row: T) {
    setEditing(row);
    setFormOpen(true);
  }

  async function handleSubmit(values: TypeOf<S>) {
    if (editing) {
      await update.mutateAsync({ id: editing.id, dto: values });
      toast.success(`${config.singular} actualizado.`);
    } else {
      await create.mutateAsync(values);
      toast.success(`${config.singular} creado.`);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    try {
      await remove.mutateAsync(pendingDelete.id);
      toast.success(`${config.singular} eliminado.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar.");
    } finally {
      setPendingDelete(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-foreground">{config.label}</h1>
        <Button onClick={openCreate}>Nuevo</Button>
      </div>

      {config.filters && config.filters.length > 0 && (
        <ResourceFilters
          filters={config.filters}
          values={filterValues}
          onChange={handleFilterChange}
        />
      )}

      <ResourceTable<T>
        columns={config.columns}
        data={list.data?.items ?? []}
        total={list.data?.total ?? 0}
        page={page}
        limit={limit}
        onPageChange={setPage}
        isLoading={list.isLoading}
        isError={list.isError}
        errorMessage={list.error?.message}
        search={config.searchParam ? search : undefined}
        onSearchChange={config.searchParam ? setSearch : undefined}
        searchPlaceholder={`Buscar ${config.label.toLowerCase()}…`}
        emptyMessage={`No hay ${config.label.toLowerCase()}.`}
        sorting={sorting}
        onSortingChange={setSorting}
        onView={setDetailRow}
        onEdit={openEdit}
        onDelete={setPendingDelete}
      />

      <ResourceForm
        key={editing ? String(editing.id) : "create"}
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editing ? `Editar ${config.singular}` : `Nuevo ${config.singular}`}
        schema={config.formSchema}
        fields={config.formFields}
        container={config.formContainer}
        defaultValues={editing ? (editing as never) : config.emptyFormValues}
        onSubmit={handleSubmit}
      />

      <ResourceDetail<T>
        open={detailRow != null}
        onOpenChange={(open) => !open && setDetailRow(null)}
        title={config.singular}
        row={detailRow}
        fields={config.detailFields}
      />

      <AlertDialog
        open={pendingDelete != null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Eliminar {config.singular}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel />
            <AlertDialogAction onClick={confirmDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
