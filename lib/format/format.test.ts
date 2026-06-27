import { describe, expect, it } from "vitest";
import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercent,
} from "./index";

describe("formato es-GT", () => {
  it("formatea Quetzales con separador de miles y 2 decimales", () => {
    const out = formatCurrency(1500);
    expect(out).toMatch(/Q/i);
    expect(out).toMatch(/1[.,\s]?500/);
    expect(out).toMatch(/00$/);
  });

  it("formatea números con separador de miles", () => {
    expect(formatNumber(12345)).toMatch(/12[.,\s]?345/);
  });

  it("formatea porcentaje desde una fracción 0–1", () => {
    const out = formatPercent(0.25);
    expect(out).toContain("25");
    expect(out).toContain("%");
  });

  it("formatea una fecha ISO sin lanzar y con el año", () => {
    expect(formatDate("2026-06-27")).toContain("2026");
  });
});
