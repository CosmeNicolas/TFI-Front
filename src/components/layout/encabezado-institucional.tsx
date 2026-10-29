import { MapPinned } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function EncabezadoInstitucional() {
  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"
          >
            <MapPinned className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium tracking-wide text-primary">
              Gestor GIS
            </p>
            <p className="truncate text-sm text-muted-foreground">
              Gestión y Seguimiento de Obras San Juan
            </p>
          </div>
        </div>
        <Badge variant="outline">Etapa 1 — estructura</Badge>
      </div>
    </header>
  );
}
