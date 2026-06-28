export type FieldType =
  | "text"
  | "number"
  | "email"
  | "textarea"
  | "select"
  | "switch"
  | "date";

export interface FieldOption {
  label: string;
  value: string | number;
}

export interface FieldConfig {
  name: string;
  label: string;
  type?: FieldType;
  placeholder?: string;
  /** Static options for type="select". Ignored when optionsEndpoint is set. */
  options?: FieldOption[];
  description?: string;
  /**
   * Endpoint to fetch options dynamically (type="select" only).
   * When set, options are fetched via useList(optionsEndpoint, { limit: 100 }).
   * Static `options` is ignored when this is present.
   */
  optionsEndpoint?: string;
  /**
   * Extract the display label from a catalog item. Defaults to `item.name`.
   */
  optionLabel?: (item: unknown) => string;
  /**
   * Extract the value (id) from a catalog item. Defaults to `item.id`.
   */
  optionValue?: (item: unknown) => string | number;
}
