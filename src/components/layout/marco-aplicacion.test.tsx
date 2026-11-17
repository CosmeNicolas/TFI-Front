import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MarcoAplicacion } from "@/components/layout/marco-aplicacion";

afterEach(() => {
  cleanup();
});

describe("MarcoAplicacion", () => {
  it("camino exitoso: renderiza encabezado, contenido y pie", () => {
    render(
      <MarcoAplicacion>
        <p>Contenido de prueba</p>
      </MarcoAplicacion>,
    );

    expect(
      screen.getByText("Gestión y Seguimiento de Obras San Juan"),
    ).toBeInTheDocument();
    expect(screen.getByText("Contenido de prueba")).toBeInTheDocument();
    expect(
      screen.getByText("Gestor GIS. Plataforma institucional en preparación."),
    ).toBeInTheDocument();
  });

  it("caso límite: el enlace de salto apunta al contenido principal", () => {
    const { getByRole } = render(
      <MarcoAplicacion>
        <span>hijo</span>
      </MarcoAplicacion>,
    );

    const salto = getByRole("link", { name: "Saltar al contenido" });
    expect(salto).toHaveAttribute("href", "#contenido-principal");
    expect(document.getElementById("contenido-principal")).not.toBeNull();
  });
});
