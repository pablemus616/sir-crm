import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { z } from "zod";
import { toast } from "sonner";
import { ResourceForm } from "./resource-form";

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
