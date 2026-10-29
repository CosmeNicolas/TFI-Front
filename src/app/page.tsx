import { ClipboardList, MapPinned, Server } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { leerUrlApi } from "@/config/entorno-publico";

const AREAS_FUTURAS = [
  {
    titulo: "Visor GIS",
    descripcion:
      "Mapa con OpenStreetMap, marcadores y popups. Leaflet se incorpora cuando existan entidades geográficas.",
    icono: MapPinned,
  },
  {
    titulo: "Módulos administrativos",
    descripcion:
      "Recursos, actas, movimientos, solicitudes, reparaciones y dependencias. Cada módulo entra en su etapa.",
    icono: ClipboardList,
  },
  {
    titulo: "API NestJS",
    descripcion:
      "El frontend consume /api/v1. Esta pantalla no llama endpoints: el contrato todavía se está cerrando.",
    icono: Server,
  },
] as const;

const PENDIENTES = [
  "Autenticación y sesión",
  "Autorización por dependencia",
  "CRUD de negocio",
  "Visor GIS con datos reales",
  "Formularios de alta y edición",
] as const;

export default function PaginaInicial() {
  const urlApi = leerUrlApi();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <section className="max-w-3xl space-y-4">
        <Badge variant="secondary">Proyecto en preparación</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Gestor GIS — Gestión y Seguimiento de Obras San Juan
        </h1>
        <p className="text-base leading-7 text-muted-foreground sm:text-lg">
          Plataforma institucional para registrar y consultar recursos,
          estaciones, actas, movimientos, solicitudes, reparaciones, proveedores
          y dependencias operativas. Esta versión solo entrega la estructura del
          frontend.
        </p>
      </section>

      <section
        className="mt-10 grid gap-4 md:grid-cols-3"
        aria-label="Áreas previstas"
      >
        {AREAS_FUTURAS.map((area) => (
          <Card key={area.titulo}>
            <CardHeader>
              <span
                aria-hidden="true"
                className="mb-2 flex size-9 items-center justify-center rounded-md bg-secondary text-primary"
              >
                <area.icono className="size-4" />
              </span>
              <CardTitle>{area.titulo}</CardTitle>
              <CardDescription>{area.descripcion}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Estado de esta etapa</CardTitle>
            <CardDescription>
              Lo que está listo es la base del repositorio, no un panel con
              datos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              Next.js App Router, TypeScript estricto, Tailwind CSS v4 y
              shadcn/ui quedan configurados. El layout admite, más adelante, un
              menú administrativo y un visor.
            </p>
            <p className="rounded-md bg-muted px-3 py-2 text-muted-foreground">
              {urlApi
                ? `URL pública del backend: ${urlApi}`
                : "NEXT_PUBLIC_API_URL todavía no está definida. Copiá .env.example a .env.local."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Todavía no implementado</CardTitle>
            <CardDescription>
              Los módulos funcionales se incorporan por etapas. Nada de lo
              siguiente está activo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {PENDIENTES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
