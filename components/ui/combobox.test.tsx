import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Combobox } from "./combobox";

const options = [
  { label: "ACME", value: "1" },
  { label: "Globex", value: "2" },
  { label: "Initech", value: "3" },
];

describe("Combobox", () => {
  it("muestra el placeholder cuando no hay valor", () => {
    render(
      <Combobox options={options} value={undefined} onChange={() => {}} placeholder="Elige…" />,
    );
    expect(screen.getByRole("button")).toHaveTextContent("Elige…");
  });

  it("muestra el label de la opción seleccionada, no el id", () => {
    render(<Combobox options={options} value="2" onChange={() => {}} placeholder="Elige…" />);
    expect(screen.getByRole("button")).toHaveTextContent("Globex");
    expect(screen.getByRole("button")).not.toHaveTextContent("2");
  });

  it("abre, filtra por texto y selecciona una opción", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Combobox options={options} value={undefined} onChange={onChange} />);

    await user.click(screen.getByRole("button"));
    await user.type(await screen.findByPlaceholderText("Buscar…"), "glob");

    await user.click(await screen.findByRole("option", { name: "Globex" }));
    expect(onChange).toHaveBeenCalledWith("2");
  });

  it("con clearable permite limpiar la selección", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Combobox options={options} value="1" onChange={onChange} clearable clearLabel="Todos" />,
    );

    await user.click(screen.getByRole("button"));
    await user.click(await screen.findByRole("option", { name: "Todos" }));
    expect(onChange).toHaveBeenCalledWith(undefined);
  });
});
