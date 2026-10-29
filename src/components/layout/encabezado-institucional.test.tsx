import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EncabezadoInstitucional } from "@/components/layout/encabezado-institucional";

describe("EncabezadoInstitucional", () => {
  it("identifica el sistema y el estado de la etapa", () => {
    render(<EncabezadoInstitucional />);

    expect(
      screen.getByText("Gestión y Seguimiento de Obras San Juan"),
    ).toBeInTheDocument();
    expect(screen.getByText("Etapa 1 — estructura")).toBeInTheDocument();
  });
});
