import type { ReactNode } from "react";
import { EncabezadoInstitucional } from "@/components/layout/encabezado-institucional";
import { PieInstitucional } from "@/components/layout/pie-institucional";

interface MarcoAplicacionProps {
  children: ReactNode;
}

export function MarcoAplicacion({ children }: MarcoAplicacionProps) {
  return (
    <div className="flex min-h-full flex-col">
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Saltar al contenido
      </a>
      <EncabezadoInstitucional />
      <main id="contenido-principal" className="flex-1">
        {children}
      </main>
      <PieInstitucional />
    </div>
  );
}
