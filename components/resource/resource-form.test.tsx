import React from "react";
import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { z } from "zod";
import { toast } from "sonner";
import { createQueryWrapper } from "@/lib/test/query-wrapper";
import { ResourceForm } from "./resource-form";

// ── Mock shadcn Select with native HTML so jsdom can interact without portals ──

vi.mock("@/components/ui/select", () => {
  type SelectCtxT = { value: string; onValueChange: (v: string) => void };
  const SelectCtx = React.createContext<SelectCtxT>({ value: "", onValueChange: () => {} });

  return {
    Select: ({
      value,
      onValueChange,
      children,
    }: {
      value: string;
      onValueChange: (v: string) => void;
      children: React.ReactNode;
    }) => (
      <SelectCtx.Provider value={{ value, onValueChange }}>
        <div data-testid="select-root">{children}</div>
      </SelectCtx.Provider>
    ),
    SelectTrigger: () => null,
    SelectValue: () => null,
    SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    SelectItem: ({
      value,
      children,
    }: {
      value: string;
      children: React.ReactNode;
    }) => {
      const { onValueChange } = React.useContext(SelectCtx);
      return (
        <button
          type="button"
          role="option"
          data-value={value}
          onClick={() => onValueChange(value)}
        >
          {children}
        </button>
      );
    },
  };
});

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const schema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().optional(),
});
const fields = [
  { name: "name", label: "Nombre" },
  { name: "description", label: "Descripción", type: "textarea" as const },
];

function setup(onSubmit: (v: unknown) => Promise<void>) {
  return render(
    <ResourceForm
      open
      onOpenChange={() => {}}
      title="Nuevo sector"
      schema={schema}
      fields={fields}
      defaultValues={{ name: "", description: "" }}
      onSubmit={onSubmit}
    />,
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function stubFetch(items: unknown[]) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      status: 200,
      json: async () => ({
        ok: true,
        message: "",
        data: { items, total: items.length, page: 1, limit: 100 },
      }),
    })),
  );
}

// ── Existing tests (no query wrapper needed) ───────────────────────────────────

describe("ResourceForm", () => {
  it("muestra error de validación de Zod y no llama onSubmit", async () => {
    const onSubmit = vi.fn(async () => {});
    setup(onSubmit);
    fireEvent.click(screen.getByRole("button", { name: /Guardar/i }));
    expect(await screen.findByText("El nombre es obligatorio")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("envía valores válidos", async () => {
    const onSubmit = vi.fn(async () => {});
    setup(onSubmit);
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Tecnología" } });
    fireEvent.click(screen.getByRole("button", { name: /Guardar/i }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Tecnología" }),
      ),
    );
  });

  it("muestra toast con el message del API si onSubmit rechaza", async () => {
    const onSubmit = vi.fn(async () => {
      throw new Error("Nombre duplicado");
    });
    setup(onSubmit);
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "X" } });
    fireEvent.click(screen.getByRole("button", { name: /Guardar/i }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Nombre duplicado"));
  });
});

// ── Date field tests ───────────────────────────────────────────────────────────

const dateSchema = z.object({
  birthDate: z.string().optional(),
});
const dateFields = [
  { name: "birthDate", label: "Fecha de nacimiento", type: "date" as const },
];

function setupDate(
  onSubmit: (v: unknown) => Promise<void>,
  defaultValues: { birthDate?: string } = { birthDate: "" },
) {
  return render(
    <ResourceForm
      open
      onOpenChange={() => {}}
      title="Nuevo candidato"
      schema={dateSchema}
      fields={dateFields}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
    />,
  );
}

describe("ResourceForm – campo type='date'", () => {
  it("renderiza un <input type='date'> enlazado al valor por defecto", () => {
    setupDate(vi.fn(async () => {}), { birthDate: "1990-05-15" });
    const input = screen.getByLabelText("Fecha de nacimiento");
    expect(input).toHaveAttribute("type", "date");
    expect(input).toHaveValue("1990-05-15");
  });

  it("al cambiar la fecha, onSubmit recibe el nuevo valor 'YYYY-MM-DD'", async () => {
    const onSubmit = vi.fn(async () => {});
    setupDate(onSubmit);
    fireEvent.change(screen.getByLabelText("Fecha de nacimiento"), {
      target: { value: "2000-01-31" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Guardar/i }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ birthDate: "2000-01-31" }),
      ),
    );
  });
});

// ── Dynamic-select field tests ─────────────────────────────────────────────────

const emptyToUndefined = (v: unknown) =>
  v === "" || v === null || v === undefined ? undefined : v;

const dynamicSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  sectorId: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().optional()),
});

const dynamicFields = [
  { name: "name", label: "Nombre" },
  {
    name: "sectorId",
    label: "Sector",
    type: "select" as const,
    optionsEndpoint: "sectors",
  },
];

function setupDynamic(onSubmit: (v: unknown) => Promise<void>) {
  const { wrapper } = createQueryWrapper();
  return render(
    <ResourceForm
      open
      onOpenChange={() => {}}
      title="Nuevo cliente"
      schema={dynamicSchema}
      fields={dynamicFields}
      defaultValues={{ name: "", sectorId: undefined }}
      onSubmit={onSubmit}
    />,
    { wrapper },
  );
}

describe("ResourceForm – select dinámico con endpoint", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("muestra las opciones del catálogo cuando optionsEndpoint está configurado", async () => {
    stubFetch([{ id: 1, name: "ACME" }]);
    setupDynamic(vi.fn(async () => {}));
    expect(await screen.findByRole("option", { name: "ACME" })).toBeInTheDocument();
  });

  it("al seleccionar una opción dinámica, onSubmit recibe el id numérico coercionado", async () => {
    stubFetch([{ id: 1, name: "ACME" }]);
    const onSubmit = vi.fn(async () => {});
    setupDynamic(onSubmit);

    // Wait for options to load
    await screen.findByRole("option", { name: "ACME" });

    // Select ACME (id=1)
    fireEvent.click(screen.getByRole("option", { name: "ACME" }));

    // Fill required name field
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Tech Corp" } });

    // Submit
    fireEvent.click(screen.getByRole("button", { name: /Guardar/i }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ sectorId: 1 }),
      ),
    );
  });

  it("el select dinámico no interfiere con campos de texto del mismo formulario", async () => {
    stubFetch([]);
    const onSubmit = vi.fn(async () => {});
    setupDynamic(onSubmit);

    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Sólo texto" } });
    fireEvent.click(screen.getByRole("button", { name: /Guardar/i }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Sólo texto" }),
      ),
    );
  });
});
