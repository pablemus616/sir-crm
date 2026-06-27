import { describe, expect, it } from "vitest";
import { buildKpis } from "../kpis";

const sample = {
  totalOpportunities: 10,
  totalWon: 4,
  conversionWonTotal: 0.4,
  conversionWonProposals: 0.5,
  proposalsSent: 8,
  proposalsAmount: 50000,
  wonValue: 120000,
  weightedValue: 30000,
};

describe("buildKpis", () => {
  it("produce 6 KPIs con conversión en porcentaje", () => {
    const kpis = buildKpis(sample);
    expect(kpis).toHaveLength(6);
    expect(kpis.find((k) => k.key === "conversion")?.value).toBe("40%");
  });
});
