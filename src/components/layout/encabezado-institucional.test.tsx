import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EncabezadoInstitucional } from "@/components/layout/encabezado-institucional";

describe("EncabezadoInstitucional", () => {
  it("camino exitoso: identifica el sistema y el estado de la etapa", () => {
    render(<EncabezadoInstitucional />);

    expect(screen.getByText("Gestor GIS")).toBeInTheDocument();
    expect(
      screen.getByText("Gestión y Seguimiento de Obras San Juan"),
    ).toBeInTheDocument();
    expect(screen.getByText("Etapa 1 — estructura")).toBeInTheDocument();
  });

  it("caso límite: no muestra métricas ni datos de negocio inventados", () => {
    const { container } = render(<EncabezadoInstitucional />);

    expect(container.textContent).not.toMatch(/1[.,]234/);
    expect(screen.queryByText(/dashboard/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /iniciar sesión/i }),
    ).toBeNull();
  });
});
