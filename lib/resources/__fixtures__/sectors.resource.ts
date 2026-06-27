import { z } from "zod";
import { createResource } from "../create-resource";

export interface Sector {
  id: number;
  name: string;
  description?: string;
}

export const sectorSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().optional(),
});

export const sectorsResource = createResource<Sector, typeof sectorSchema>({
  key: "sectors",
  label: "Sectores",
  singular: "Sector",
  endpoint: "sectors",
  access: "admin",
  searchParam: "search",
  columns: [
    { accessorKey: "name", header: "Nombre" },
    { accessorKey: "description", header: "Descripción" },
  ],
  formSchema: sectorSchema,
  formFields: [
    { name: "name", label: "Nombre" },
    { name: "description", label: "Descripción", type: "textarea" },
  ],
  detailFields: [
    { label: "Nombre", render: (r) => r.name },
    { label: "Descripción", render: (r) => r.description ?? "—" },
  ],
  emptyFormValues: { name: "", description: "" },
});
