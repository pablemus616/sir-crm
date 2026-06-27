"use client";

import type { ReactNode } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";

export interface DetailField<T> {
  label: string;
  render: (row: T) => ReactNode;
}

export interface ResourceDetailProps<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  row: T | null | undefined;
  fields: DetailField<T>[];
  isLoading?: boolean;
  footer?: ReactNode;
}

export function ResourceDetail<T>({
  open,
  onOpenChange,
  title,
  row,
  fields,
  isLoading,
  footer,
}: ResourceDetailProps<T>) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
        </DrawerHeader>
        <div className="space-y-4 px-4 pb-4">
          {isLoading || !row ? (
            <div data-testid="resource-detail-skeleton" className="space-y-3">
              {Array.from({ length: fields.length || 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <dl className="grid gap-3">
              {fields.map((field) => (
                <div
                  key={field.label}
                  className="grid grid-cols-3 gap-2 border-b border-border pb-2"
                >
                  <dt className="text-sm font-medium text-muted-foreground">
                    {field.label}
                  </dt>
                  <dd className="col-span-2 text-sm text-foreground">
                    {field.render(row)}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        {footer && <DrawerFooter>{footer}</DrawerFooter>}
      </DrawerContent>
    </Drawer>
  );
}
