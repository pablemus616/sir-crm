import type { ColumnDef } from "@tanstack/react-table";
import type { DefaultValues } from "react-hook-form";
import type { TypeOf, ZodType } from "zod";
import type { FieldConfig } from "@/components/resource/field-config";
import type { DetailField } from "@/components/resource/resource-detail";
import type { ResourceClient } from "@/lib/api/resource-client";
import type { ResourceHooks } from "@/lib/api/hooks";

export interface ResourceConfig<T, S extends ZodType> {
  key: string;
  label: string;
  singular: string;
  endpoint: string;
  access: "admin" | "auth";
  columns: ColumnDef<T, unknown>[];
  formSchema: S;
  formFields: FieldConfig[];
  detailFields: DetailField<T>[];
  emptyFormValues: DefaultValues<TypeOf<S>>;
  searchParam?: string;
  defaultLimit?: number;
}

export interface ResourceDescriptor<T, S extends ZodType> {
  config: ResourceConfig<T, S>;
  client: ResourceClient<T, TypeOf<S>, Partial<TypeOf<S>>>;
  hooks: ResourceHooks<T, TypeOf<S>, Partial<TypeOf<S>>>;
}
