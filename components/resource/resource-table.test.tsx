import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { ColumnDef } from "@tanstack/react-table";
import { ResourceTable } from "./resource-table";

interface Row { id: number; name: string }
const columns: ColumnDef<Row, unknown>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "name", header: "Nombre" },
];
const data: Row[] = [
  { id: 1, name: "ACME" },
  { id: 2, name: "Globex" },
];

function base(overrides = {}) {
  return { columns, data, total: 40, page: 1, limit: 20, onPageChange: vi.fn(), ...overrides };
}

describe("ResourceTable", () => {
  it("renderiza encabezados y filas", () => {
    render(<ResourceTable {...base()} />);
    expect(screen.getByText("Nombre")).toBeInTheDocument();
    expect(screen.getByText("ACME")).toBeInTheDocument();
    expect(screen.getByText("Globex")).toBeInTheDocument();
  });

  it("muestra skeleton en loading (sin filas de datos)", () => {
    render(<ResourceTable {...base({ data: [], isLoading: true })} />);
    expect(screen.queryByText("ACME")).not.toBeInTheDocument();
    expect(screen.getByTestId("resource-table-skeleton")).toBeInTheDocument();
  });

  it("muestra estado vacío", () => {
    render(<ResourceTable {...base({ data: [], total: 0, emptyMessage: "Sin clientes" })} />);
    expect(screen.getByText("Sin clientes")).toBeInTheDocument();
  });

  it("muestra estado de error", () => {
    render(<ResourceTable {...base({ data: [], isError: true, errorMessage: "Falló la carga" })} />);
    expect(screen.getByText("Falló la carga")).toBeInTheDocument();
  });

  it("calcula páginas por offset y dispara onPageChange", () => {
    const onPageChange = vi.fn();
    render(<ResourceTable {...base({ page: 1, onPageChange })} />);
    expect(screen.getByText(/Página 1 de 2/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Siguiente/i }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("deshabilita Anterior en la primera página", () => {
    render(<ResourceTable {...base({ page: 1 })} />);
    expect(screen.getByRole("button", { name: /Anterior/i })).toBeDisabled();
  });

  it("propaga búsqueda", () => {
    const onSearchChange = vi.fn();
    render(<ResourceTable {...base({ onSearchChange, searchPlaceholder: "Buscar" })} />);
    fireEvent.change(screen.getByPlaceholderText("Buscar"), { target: { value: "ac" } });
    expect(onSearchChange).toHaveBeenCalledWith("ac");
  });

  it("invoca acciones de fila", () => {
    const onEdit = vi.fn();
    render(<ResourceTable {...base({ onEdit })} />);
    fireEvent.click(screen.getAllByLabelText("Acciones de fila")[0]);
    fireEvent.click(screen.getByText("Editar"));
    expect(onEdit).toHaveBeenCalledWith(data[0]);
  });
});
