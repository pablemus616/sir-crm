import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

function mockListAndCreate(items: unknown[]) {
  const spy = vi.fn(async (_url: string, init?: RequestInit) => {
    if (init?.method === "POST") {
      return {
        status: 201,
        json: async () => ({
          ok: true,
          message: "",
          data: { id: 99, ...(items[0] ?? {}) },
        }),
      } as unknown as Response;
    }
    return {
      status: 200,
      json: async () => ({
        ok: true,
        message: "",
        data: { items, total: items.length, page: 1, limit: 20 },
      }),
    } as unknown as Response;
  });
  vi.stubGlobal("fetch", spy);
  return spy;
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

  // ── Interaction tests ─────────────────────────────────────────────────────

  it("clic en Nuevo abre el formulario", async () => {
    mockList([]);
    const { wrapper } = createQueryWrapper();
    render(<ResourceView resource={sectorsResource} />, { wrapper });

    fireEvent.click(screen.getByRole("button", { name: "Nuevo" }));

    expect(await screen.findByText("Nuevo Sector")).toBeInTheDocument();
  });

  it("completar y enviar el formulario lanza la mutación POST y cierra el diálogo", async () => {
    const fetchMock = mockListAndCreate([]);
    const { wrapper } = createQueryWrapper();
    render(<ResourceView resource={sectorsResource} />, { wrapper });

    // Abrir formulario
    fireEvent.click(screen.getByRole("button", { name: "Nuevo" }));
    await screen.findByText("Nuevo Sector");

    // Rellenar el campo Nombre
    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "Tecnología" },
    });

    // Enviar
    fireEvent.click(screen.getByRole("button", { name: /Guardar/i }));

    // Confirmar que se llamó fetch con método POST
    await waitFor(() => {
      const postCall = fetchMock.mock.calls.find(([, init]) => init?.method === "POST");
      expect(postCall).toBeDefined();
    });

    // El diálogo se cierra tras el éxito
    await waitFor(() =>
      expect(screen.queryByText("Nuevo Sector")).not.toBeInTheDocument(),
    );
  });

  it("clic en Editar abre el formulario con los valores precargados", async () => {
    mockList([{ id: 1, name: "Tecnología", description: "TI" }]);
    const { wrapper } = createQueryWrapper();
    render(<ResourceView resource={sectorsResource} />, { wrapper });

    // Esperar a que la fila cargue
    await screen.findByText("Tecnología");

    // Abrir menú de acciones de la primera fila y hacer clic en Editar
    fireEvent.click(screen.getByLabelText("Acciones de fila"));
    fireEvent.click(screen.getByText("Editar"));

    // El formulario debe abrirse con el título de edición y el campo precargado
    expect(await screen.findByText("Editar Sector")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Tecnología")).toBeInTheDocument();
  });
});
