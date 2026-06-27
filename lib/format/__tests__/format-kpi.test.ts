import { describe, expect, it } from "vitest";
import { formatDuration, formatPercent } from "../index";

describe("formatPercent", () => {
  it("convierte ratio a porcentaje", () => {
    expect(formatPercent(0.42)).toBe("42%");
  });
  it("protege contra NaN", () => {
    expect(formatPercent(Number.NaN)).toBe("0%");
  });
});

describe("formatDuration", () => {
  it("muestra días y horas", () => {
    expect(formatDuration(90_000)).toBe("1 d 1 h");
  });
  it("devuelve guion para 0", () => {
    expect(formatDuration(0)).toBe("—");
  });
});
