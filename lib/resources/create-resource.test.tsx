import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { createQueryWrapper } from "@/lib/test/query-wrapper";
import { ResourceView } from "@/components/resource/resource-view";
import { sectorsResource, sectorSchema } from "./__fixtures__/sectors.resource";

function mockList(items: unknown[]) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      status: 200,
      json: async () => ({
        ok: true,
        message: "",
        data: { items, total: items.length, page: 1, limit: 20 },
      }),
    }) as unknown as Response),
  );
}
afterEach(() => vi.unstubAllGlobals());

describe("createResource", () => {
  it("ensambla descriptor con client, hooks y config", () => {
    expect(sectorsResource.config.key).toBe("sectors");
    expect(sectorsResource.client.base).toBe("sectors");
    expect(typeof sectorsResource.hooks.useList).toBe("function");
  });

  it("el formSchema valida los DTOs del backend", () => {
    expect(sectorSchema.safeParse({ name: "" }).success).toBe(false);
    expect(sectorSchema.safeParse({ name: "Tecnología" }).success).toBe(true);
  });

  it("ResourceView lista filas del recurso vía hooks", async () => {
    mockList([{ id: 1, name: "Tecnología", description: "TI" }]);
    const { wrapper } = createQueryWrapper();
    render(<ResourceView resource={sectorsResource} />, { wrapper });
    expect(await screen.findByText("Tecnología")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/1 resultado/)).toBeInTheDocument());
  });

  it("ResourceView muestra encabezado y botón Nuevo", async () => {
    mockList([]);
    const { wrapper } = createQueryWrapper();
    render(<ResourceView resource={sectorsResource} />, { wrapper });
    expect(screen.getByRole("heading", { name: "Sectores" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nuevo" })).toBeInTheDocument();
    expect(await screen.findByText("No hay sectores.")).toBeInTheDocument();
  });
});
