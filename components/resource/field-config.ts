export type FieldType = "text" | "number" | "email" | "textarea" | "select" | "switch";

export interface FieldOption {
  label: string;
  value: string | number;
}

export interface FieldConfig {
  name: string;
  label: string;
  type?: FieldType;
  placeholder?: string;
  options?: FieldOption[];
  description?: string;
}
