/**
 * TDD tests for ResourceView list-filter behavior.
 *
 * We mock FilterSelect and Switch with native HTML elements to avoid the
 * jsdom/portal complexity of base-ui Select/Switch. The goal of these tests
 * is to verify ResourceView's filter→param→URL wiring, not the underlying
 * UI library behavior.
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { z } from "zod";
import { createQueryWrapper } from "@/lib/test/query-wrapper";
import { ResourceView } from "@/components/resource/resource-view";
import { createResource } from "@/lib/resources/create-resource";

// ── Mock light-weight controls ────────────────────────────────────────────────
// Replace base-ui-backed FilterSelect and Switch with plain HTML so we can use
// fireEvent without portal/focus issues in jsdom.

vi.mock("@/components/dashboard/filter-select", () => ({
  FilterSelect: ({
    placeholder,
    value,
    options,
    onChange,
  }: {
    placeholder: string;
    value: string | number | undefined;
    options: { label: string; value: string }[];
    onChange: (value: string | undefined) => void;
  }) => (
    <select
      aria-label={placeholder}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || undefined)}
    >
      <option value="">{placeholder}: todos</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  ),
}));

vi.mock("@/components/ui/switch", () => ({
  Switch: ({
    id,
    checked,
    onCheckedChange,
  }: {
    id?: string;
    checked: boolean;
    onCheckedChange: (v: boolean) => void;
  }) => (
    <input
      id={id}
      type="checkbox"
      role="switch"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
    />
  ),
}));

// ── Fixture resource ──────────────────────────────────────────────────────────

const itemSchema = z.object({ name: z.string().min(1) });

/** Resource with one static-select filter ("estado") and one toggle ("activo") */
const filteredResource = createResource<{ id: number; name: string }, typeof itemSchema>({
  key: "items",
  label: "Items",
  singular: "Item",
  endpoint: "items",
  access: "auth",
  columns: [{ accessorKey: "name", header: "Nombre" }],
  formSchema: itemSchema,
  formFields: [{ name: "name", label: "Nombre" }],
  detailFields: [{ label: "Nombre", render: (r) => r.name }],
  emptyFormValues: { name: "" },
  filters: [
    {
      key: "estado",
      label: "Estado",
      type: "select",
      options: [
        { label: "Abierto", value: "open" },
        { label: "Cerrado", value: "closed" },
      ],
    },
    {
      key: "activo",
      label: "Activo",
      type: "toggle",
    },
  ],
});

// ── Helpers ────────────────────────────────────────────────────────────────────

function listResponse(
  items: unknown[],
  extras: { total?: number; page?: number } = {},
) {
  return {
    status: 200,
    json: async () => ({
      ok: true,
      message: "",
      data: {
        items,
        total: extras.total ?? items.length,
        page: extras.page ?? 1,
        limit: 20,
      },
    }),
  } as unknown as Response;
}

function stubFetch(items: unknown[] = [{ id: 1, name: "Alpha" }]) {
  const spy = vi.fn(async () => listResponse(items));
  vi.stubGlobal("fetch", spy);
  return spy;
}

afterEach(() => vi.unstubAllGlobals());

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("ResourceView – filtros de lista", () => {
  it("(a) muestra los controles de filtro declarados en config", async () => {
    stubFetch();
    const { wrapper } = createQueryWrapper();
    render(<ResourceView resource={filteredResource} />, { wrapper });

    await screen.findByText("Alpha");

    // The select filter label appears as the placeholder text
    expect(screen.getByRole("combobox", { name: "Estado" })).toBeInTheDocument();
    // The toggle label appears beside the switch
    expect(screen.getByText("Activo")).toBeInTheDocument();
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("(b) seleccionar un valor de filtro agrega el param al URL de la solicitud", async () => {
    const spy = stubFetch();
    const { wrapper } = createQueryWrapper();
    render(<ResourceView resource={filteredResource} />, { wrapper });

    await screen.findByText("Alpha");

    // Change the "Estado" select to "Abierto" (value="open")
    fireEvent.change(screen.getByRole("combobox", { name: "Estado" }), {
      target: { value: "open" },
    });

    await waitFor(() => {
      const urls = spy.mock.calls.map((args: unknown[]) => args[0] as string);
      expect(urls.some((u) => u.includes("estado=open"))).toBe(true);
    });
  });

  it("(c) activar/desactivar el toggle agrega y elimina el param del URL", async () => {
    const spy = stubFetch();
    const { wrapper } = createQueryWrapper();
    render(<ResourceView resource={filteredResource} />, { wrapper });

    await screen.findByText("Alpha");

    const toggle = screen.getByRole("switch");

    // Toggle ON → activo=true should appear in the next fetch URL
    fireEvent.click(toggle);

    await waitFor(() => {
      const urls = spy.mock.calls.map((args: unknown[]) => args[0] as string);
      expect(urls.some((u) => u.includes("activo=true"))).toBe(true);
    });

    // Toggle OFF → activo param should be absent from the next fetch
    fireEvent.click(toggle);

    await waitFor(() => {
      const urls = spy.mock.calls.map((args: unknown[]) => args[0] as string);
      const lastUrl = urls.at(-1) ?? "";
      expect(lastUrl).not.toContain("activo=true");
    });
  });

  it("(d) cambiar un filtro reinicia la página a 1", async () => {
    // Return a large list so pagination buttons appear (total=100, page always 1 from server)
    const spy = vi.fn(async () =>
      listResponse([{ id: 1, name: "Alpha" }], { total: 100 }),
    );
    vi.stubGlobal("fetch", spy);

    const { wrapper } = createQueryWrapper();
    render(<ResourceView resource={filteredResource} />, { wrapper });

    await screen.findByText("Alpha");

    // Advance to page 2
    fireEvent.click(screen.getByRole("button", { name: /Siguiente/i }));

    await waitFor(() => {
      const urls = spy.mock.calls.map((args: unknown[]) => args[0] as string);
      expect(urls.some((u) => u.includes("page=2"))).toBe(true);
    });

    // Now change the toggle filter → should reset page to 1
    fireEvent.click(screen.getByRole("switch"));

    await waitFor(() => {
      const urls = spy.mock.calls.map((args: unknown[]) => args[0] as string);
      const lastUrl = urls.at(-1) ?? "";
      // After filter change the request must NOT be for page 2
      expect(lastUrl).not.toContain("page=2");
      // And the filter param must be present
      expect(lastUrl).toContain("activo=true");
    });
  });
});
