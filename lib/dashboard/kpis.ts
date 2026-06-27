import type { CommercialMetrics } from "@/lib/api/metrics-types";
import { formatGTQ, formatPercent } from "@/lib/format";

export interface KpiItem {
  key: string;
  label: string;
  value: string;
  hint?: string;
}

export function buildKpis(c: CommercialMetrics): KpiItem[] {
  return [
    { key: "total", label: "Oportunidades", value: String(c.totalOpportunities) },
    { key: "won", label: "Ventas ganadas", value: String(c.totalWon) },
    {
      key: "conversion",
      label: "Conversión",
      value: formatPercent(c.conversionWonTotal),
      hint: `${formatPercent(c.conversionWonProposals)} sobre propuestas`,
    },
    { key: "wonValue", label: "Quetzales ganados", value: formatGTQ(c.wonValue) },
    { key: "forecast", label: "Forecast ponderado", value: formatGTQ(c.weightedValue) },
    {
      key: "proposals",
      label: "Propuestas enviadas",
      value: String(c.proposalsSent),
      hint: formatGTQ(c.proposalsAmount),
    },
  ];
}
