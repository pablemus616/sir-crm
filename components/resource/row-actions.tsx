"use client";

import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface RowActionsProps<T> {
  row: T;
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
}

export function RowActions<T>({ row, onView, onEdit, onDelete }: RowActionsProps<T>) {
  if (!onView && !onEdit && !onDelete) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Acciones de fila"
        className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onView && <DropdownMenuItem onClick={() => onView(row)}>Ver</DropdownMenuItem>}
        {onEdit && <DropdownMenuItem onClick={() => onEdit(row)}>Editar</DropdownMenuItem>}
        {onDelete && (
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => onDelete(row)}
          >
            Borrar
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
