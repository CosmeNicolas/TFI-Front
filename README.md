# Gestor GIS — Frontend

Frontend de la plataforma institucional **Gestor GIS — Gestión y Seguimiento de Obras San Juan**. Esta versión es el scaffolding de la Etapa 1. No hay login, visor GIS ni datos de negocio.

## 1. Nombre y descripción

Aplicación web para consultar y gestionar recursos, estaciones, actas, movimientos, solicitudes, reparaciones, proveedores y dependencias operativas. Incluirá un visor geográfico. El backend vive en el repositorio `TFI-Back` (NestJS) y es la autoridad de reglas, permisos y persistencia.

## 2. Objetivos

- Dejar una base Next.js mantenible, estricta y documentada.
- Separar layout, componentes visuales, módulos y acceso HTTP.
- Preparar el consumo de `/api/v1` sin llamar endpoints todavía inexistentes.
- No adelantar autenticación, CRUD ni el mapa.

## 3. Funcionalidades previstas

Previstas, no implementadas:

- Autenticación y sesión.
- Roles y permisos (el frontend no es la autoridad).
- Módulos de recursos, actas, movimientos, solicitudes y reparaciones.
- Visor GIS con marcadores, popups, tablas y filtros.
- Formularios de alta y edición.
- Notificaciones de operación.

Implementado en esta etapa:

- Next.js App Router con TypeScript estricto.
- Tailwind CSS v4 y shadcn/ui.
- Layout institucional y página inicial.
- Cliente HTTP preparado, sin llamadas reales.
- Variables de entorno de ejemplo.
- ESLint, Prettier, Vitest y GitHub Actions.

## 4. Tecnologías y justificación

| Tecnología                     | Uso                                                                                          |
| ------------------------------ | -------------------------------------------------------------------------------------------- |
| Next.js 16 App Router          | Enrutado, Server Components por defecto y build de producción.                               |
| React 19                       | Interfaz. Los Client Components se usan solo con estado de navegador o librerías de cliente. |
| TypeScript estricto            | Contratos explícitos.                                                                        |
| Tailwind CSS v4                | Estilos. Next 16 y shadcn actual generan v4; no se mezcla con v3.                            |
| shadcn/ui (estilo `base-nova`) | Componentes accesibles. Solo se instalaron Button (lo genera `init`), Card y Badge.          |
| Lucide React                   | Iconos.                                                                                      |
| Vitest y Testing Library       | Pruebas unitarias del cliente HTTP, del entorno y del encabezado.                            |
| Leaflet y React Leaflet        | Previstos para la Etapa 6. No están instalados.                                              |
| npm                            | Gestor de este repositorio.                                                                  |

## 5. Requisitos previos

- Node.js 20.9 o superior. En este entorno se usó 26.13.0 (`nvm use 26.13.0`).
- npm 11.
- Git.
- El backend no es obligatorio para ver la página inicial.

## 6. Instalación

```bash
cd TFI-Front
nvm use 26.13.0
npm ci
copy .env.example .env.local
npm run dev
```

En PowerShell: `copy .env.example .env.local`. El archivo `.env.local` no se versiona. La app queda en [http://localhost:3000](http://localhost:3000).

## 7. Variables de entorno

| Variable              | Pública | Descripción                                                                       |
| --------------------- | ------- | --------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | Sí      | Origen del backend, incluido el prefijo. Ejemplo: `http://localhost:3001/api/v1`. |

No hay claves de Supabase ni tokens. Nada secreto va en `NEXT_PUBLIC_*`: el navegador las ve.

## 8. Comandos

| Comando                | Acción                 |
| ---------------------- | ---------------------- |
| `npm run dev`          | Desarrollo.            |
| `npm run build`        | Compila.               |
| `npm start`            | Sirve el build.        |
| `npm run lint`         | ESLint, sin warnings.  |
| `npm run typecheck`    | `tsc --noEmit`.        |
| `npm run format`       | Prettier.              |
| `npm run format:check` | Comprueba el formato.  |
| `npm test`             | Vitest.                |
| `npm run test:watch`   | Vitest en observación. |

## 9. Estructura de carpetas

```text
src/
  app/                 rutas y layout de App Router
  components/
    layout/            encabezado, pie y marco
    ui/                componentes de shadcn/ui
  config/              variables públicas
  lib/
    api/               cliente HTTP
    utils.ts           `cn`, generado por shadcn
  types/               contratos de API
  test/                setup de Vitest
docs/
.github/workflows/
```

Carpetas previstas, todavía sin archivos:

- `src/modules/`: casos de uso (recursos, actas, visor).
- `src/hooks/`: estado de cliente reutilizable.
- `src/components/shared/`: piezas visuales que no sean de un módulo ni de shadcn.

No se crearon vacías.

## 10. Tailwind CSS

Tailwind v4 entra por `@import "tailwindcss"` en `src/app/globals.css`. No hay `tailwind.config.js`: en v4 el tema vive en CSS.

Los tokens institucionales (azules, fondos neutros, radios, estados de error) están en `:root` y `.dark`. El HTML no activa `.dark` por ahora: la interfaz institucional queda en claro.

## 11. shadcn/ui

Inicializado con el CLI oficial sobre Next.js y Tailwind v4. `components.json` usa estilo `base-nova`, `baseColor` `neutral` y alias `@/*`. Los colores primarios se ajustaron en CSS hacia un azul institucional.

Componentes instalados: `button`, `card`, `badge`. El resto (form, table, sidebar, dialog, toast, etc.) se agrega cuando una pantalla lo use: `npx shadcn@latest add <nombre>`.

## 12. Convenciones de componentes

- `src/components/ui`: solo lo que genera shadcn.
- `src/components/layout`: cromado de la aplicación.
- Un módulo futuro no importa SQL ni reglas de otro módulo.
- Server Component por defecto. `"use client"` solo con estado, efectos o Leaflet.

## 13. Arquitectura

- **Páginas** (`app/`): composición y metadata.
- **Layout**: navegación y marco, sin reglas de negocio.
- **Módulos** (futuros): un caso de uso por carpeta.
- **Hooks**: estado de cliente compartido cuando deje de caber en un componente.
- **Cliente HTTP**: transporte. Sin reglas de dominio. Ver [docs/cliente-http.md](docs/cliente-http.md).
- **Validación de formularios**: en el cliente para UX; el backend valida de nuevo.

Patrones útiles más adelante, no impuestos: contenedor/presentación para el visor, adaptador para el cliente HTTP, y un store local solo si mapa y tabla necesitan el mismo `recursoSeleccionado`.

## 14. Integración futura con NestJS

`NEXT_PUBLIC_API_URL` apunta a `http://localhost:3001/api/v1`. `solicitarJson` sabe interpretar el cuerpo de error del backend y los códigos 401 y 403, pero la interfaz no lo invoca. La sesión, la renovación y el CSRF se definen en la Etapa 3.

## 15. Preparación GIS

Ver [docs/preparacion-gis.md](docs/preparacion-gis.md). Leaflet se carga en un Client Component, con `ssr: false` si hace falta. OpenStreetMap es la base inicial; sus teselas públicas no se asumen ilimitadas en producción. Hay que conservar la atribución. No se inventan coordenadas.

## 16. Seguridad

- El frontend no guarda secretos ni claves de servicio.
- Un menú oculto no autoriza: el backend decide.
- No se usa `dangerouslySetInnerHTML`.
- No se registran tokens en la consola.
- La sesión no irá a `localStorage` cuando se implemente; se evalúa cookie httpOnly.
- CSP se ajusta cuando existan mapa, teselas y API reales.

## 17. Código limpio

Funciones cortas, un archivo una responsabilidad. La página inicial no llama a la API. El encabezado no conoce el cliente HTTP.

## 18. SOLID

Los componentes de layout no dependen de módulos de negocio. El cliente HTTP depende de la URL pública, no de un recurso concreto. No hay interfaces con una sola implementación.

## 19. DRY

`cn` unifica clases. El cuerpo de error del backend se interpreta en un solo lugar. No se extrae un “Card genérico de módulo” hasta que dos módulos lo necesiten de verdad.

## 20. YAGNI

No hay login, mapa, CRUD, React Query ni otra librería de componentes. Leaflet se instala en la etapa del visor.

## 21. Nombres en español

Dominio y UI en español: `recursoSeleccionado`, `leerUrlApi`, `EncabezadoInstitucional`. Inglés para Next, React, shadcn y archivos que el framework exige (`page.tsx`, `layout.tsx`).

## 22. Estrategia de pruebas

Vitest con jsdom y Testing Library. Hoy cubren el entorno público, el cliente HTTP con `fetch` simulado y el encabezado. No hay pruebas e2e ni llamadas a un backend real. No se apagan reglas de TypeScript ni de ESLint para hacerlas pasar.

## 23. Git y GitHub

Ramas: `main`; `develop` si el equipo la usa; `feature/…`, `fix/…`, `docs/…`. Un cambio entra por pull request con CI en verde. El workflow corre lint, tipos, formato, tests y build, sin secretos.

## 24. Revisión de código

Se mira que no entre un secreto, que un Server Component no importe Leaflet a la fuerza, y que una pantalla no llame endpoints que todavía no existen.

## 25. Roadmap

1. Estructura del repositorio. Esta etapa.
2. Dominio y contratos de API.
3. Autenticación e integración con el backend.
4. Interfaz administrativa y navegación.
5. Recursos, actas, movimientos y solicitudes.
6. Visor GIS, popups, tablas y filtros.
7. Pruebas integrales, accesibilidad, seguridad y despliegue.

Nombrar una etapa no significa que esté hecha.

## 26. Decisiones pendientes

- Estrategia de sesión (cookie httpOnly frente a otra opción) junto con el backend.
- Proveedor de teselas para producción.
- Si el visor usa agrupación de marcadores desde el primer hito.
- Biblioteca de formularios cuando existan altas reales.
- Uso de `develop` desde el primer merge.

## 27. Limitaciones conocidas

- Sin autenticación. La página inicial es pública.
- El cliente HTTP no se usa en la interfaz.
- Sin mapa ni datos geográficos.
- Un solo origen de API, tomado de una variable pública.
- ESLint 9 viene con Next 16.4.3; npm avisa que esa línea de ESLint está fuera de soporte. No se sube a ESLint 10 hasta que `eslint-config-next` lo declare.
- El repositorio Git local todavía no tiene remoto.
