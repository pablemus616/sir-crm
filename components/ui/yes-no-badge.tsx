import { Badge } from "@/components/ui/badge";

/**
 * Render consistente de un booleano como Badge ("Sí" / "No"), para que las
 * columnas de lista y los campos de detalle de catálogos se vean igual en todas
 * partes. `value` puede venir null/undefined desde el backend; lo tratamos como
 * falso (No).
 */
export function YesNoBadge({ value }: { value?: boolean | null }) {
  return (
    <Badge variant={value ? "default" : "secondary"}>{value ? "Sí" : "No"}</Badge>
  );
}
