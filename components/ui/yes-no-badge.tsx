import { Badge } from "@/components/ui/badge";

/**
 * Render consistente de un booleano como Badge ("Sí" / "No"), para que las
 * columnas de lista y los campos de detalle de catálogos se vean igual en todas
 * partes. `value` puede venir null/undefined desde el backend; lo tratamos como
 * falso (No).
 *
 * `tone` ajusta el color del "Sí": por defecto ("positive") usa el color de
 * marca; para flags negativos como `isLost` ("negative") usa un tono destructivo
 * tenue, evitando resaltar un estado negativo como si fuera bueno.
 */
export function YesNoBadge({
  value,
  tone = "positive",
}: {
  value?: boolean | null;
  tone?: "positive" | "negative";
}) {
  const yesVariant = tone === "negative" ? "destructive" : "default";
  return (
    <Badge variant={value ? yesVariant : "secondary"}>{value ? "Sí" : "No"}</Badge>
  );
}
