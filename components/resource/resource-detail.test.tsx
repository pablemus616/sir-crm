import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResourceDetail } from "./resource-detail";

interface Row { id: number; name: string; sector: string }

describe("ResourceDetail", () => {
  const fields = [
    { label: "Nombre", render: (r: Row) => r.name },
    { label: "Sector", render: (r: Row) => r.sector },
  ];

  it("renderiza pares etiqueta/valor cuando hay row", () => {
    render(
      <ResourceDetail
        open
        onOpenChange={() => {}}
        title="Cliente"
        row={{ id: 1, name: "ACME", sector: "Tecnología" }}
        fields={fields}
      />,
    );
    expect(screen.getByText("Nombre")).toBeInTheDocument();
    expect(screen.getByText("ACME")).toBeInTheDocument();
    expect(screen.getByText("Tecnología")).toBeInTheDocument();
  });

  it("muestra skeleton en loading", () => {
    render(
      <ResourceDetail open onOpenChange={() => {}} title="Cliente" row={null} fields={fields} isLoading />,
    );
    expect(screen.getByTestId("resource-detail-skeleton")).toBeInTheDocument();
  });
});
