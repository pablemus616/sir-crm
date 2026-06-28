import type { ColumnDef } from "@tanstack/react-table";
import type { DefaultValues } from "react-hook-form";
import type { TypeOf, ZodType } from "zod";
import type { FieldConfig } from "@/components/resource/field-config";
import type { DetailField } from "@/components/resource/resource-detail";
import type { ResourceClient } from "@/lib/api/resource-client";
import type { ResourceHooks } from "@/lib/api/hooks";

export interface ResourceFilter {
  /** The list param name, e.g. 'clientId', 'wasHandled', 'stage', 'active' */
  key: string;
  /** Spanish label shown beside the control */
  label: string;
  type: "select" | "toggle";
  /** Static options (mutually exclusive with optionsEndpoint) */
  options?: { label: string; value: string | number }[];
  /** Fetch options from this catalog endpoint via useList({ limit: 100 }) */
  optionsEndpoint?: string;
  /** How to render the label of a fetched option (default: item.name) */
  optionLabel?: (item: unknown) => string;
  /** How to get the value of a fetched option (default: item.id) */
  optionValue?: (item: unknown) => string | number;
}

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
  filters?: ResourceFilter[];
}

export interface ResourceDescriptor<T, S extends ZodType> {
  config: ResourceConfig<T, S>;
  client: ResourceClient<T, TypeOf<S>, Partial<TypeOf<S>>>;
  hooks: ResourceHooks<T, TypeOf<S>, Partial<TypeOf<S>>>;
}
