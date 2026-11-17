import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PieInstitucional } from "@/components/layout/pie-institucional";

describe("PieInstitucional", () => {
  it("informa que el frontend y el backend previstos están en preparación", () => {
    render(<PieInstitucional />);

    expect(
      screen.getByText("Gestor GIS. Plataforma institucional en preparación."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Frontend Next.js. Backend previsto en NestJS."),
    ).toBeInTheDocument();
  });
});
