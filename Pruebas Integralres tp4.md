# Pruebas Integralres TP4

Guía principal para comprender, ejecutar y verificar la suite de pruebas del Trabajo Práctico N.º 4 del proyecto **Gestor GIS — Gestión y Seguimiento de Obras San Juan**.

Complementa a `reporte-verificacion.md` (informe de resultados). Este archivo es el manual de uso.

> Nota: el nombre del archivo respeta exactamente el enunciado del TP (`Pruebas Integralres tp4.md`).

---

## 1. Presentación

La suite automatiza la verificación del scaffolding actual del Gestor GIS: el backend NestJS y el frontend Next.js en su Etapa 1.

**Objetivo:** detectar regresiones en salud del API, validación, errores, layout institucional y cliente HTTP antes de incorporar módulos de negocio.

**Problema que previene:** avanzar hacia autenticación, CRUD o GIS sobre una base que no responde de forma predecible, o romper contratos HTTP sin darnos cuenta.

**Por qué importa:** sin pruebas ejecutables, cada cambio futuro (actas, movimientos, mapa) se vuelve más riesgoso. Esta suite fija el comportamiento conocido del andamiaje.

## 2. Tecnologías utilizadas

| Herramienta | Repositorio | Para qué se usa |
| --- | --- | --- |
| Jest 30 | `TFI-Back` | Runner de unitarias, integración y E2E |
| `@nestjs/testing` | `TFI-Back` | Armar módulos Nest en memoria |
| Supertest 7 | `TFI-Back` | Solicitudes HTTP contra la app de prueba |
| Vitest 5 | `TFI-Front` | Runner de unitarias del frontend |
| React Testing Library | `TFI-Front` | Renderizado y consultas de componentes |
| `@testing-library/jest-dom` | `TFI-Front` | Matchers (`toBeInTheDocument`, etc.) |
| ESLint / TypeScript | Ambos | Calidad estática junto a las pruebas |

No se documentan Playwright, Cypress, ni drivers de PostgreSQL: no están instalados ni se usaron.

## 3. Organización de los archivos de prueba

Estructura real relevante:

```text
TFI - UTN/
│
├── TFI-Back/
│   ├── src/
│   │   ├── common/filters/
│   │   │   ├── http-exception.filter.ts
│   │   │   └── http-exception.filter.spec.ts
│   │   ├── config/
│   │   │   ├── environment.validation.ts
│   │   │   └── environment.validation.spec.ts
│   │   ├── modules/health/
│   │   │   ├── health.controller.ts
│   │   │   ├── health.controller.spec.ts
│   │   │   ├── health.service.ts
│   │   │   ├── health.service.spec.ts
│   │   │   ├── health.integration.spec.ts
│   │   │   └── health.module.ts
│   │   ├── configurar-aplicacion.ts
│   │   └── configurar-aplicacion.spec.ts
│   ├── test/
│   │   ├── app.e2e-spec.ts
│   │   ├── jest-e2e.json
│   │   └── setup-env.cjs
│   └── package.json
│
├── TFI-Front/
│   ├── src/
│   │   ├── components/layout/
│   │   │   ├── encabezado-institucional.test.tsx
│   │   │   ├── marco-aplicacion.test.tsx
│   │   │   └── pie-institucional.test.tsx
│   │   ├── config/entorno-publico.test.ts
│   │   ├── lib/api/cliente-http.test.ts
│   │   └── test/setup.ts
│   └── package.json
│
├── readmeMetodologia.md
├── reporte-verificacion.md
└── Pruebas Integralres tp4.md
```

## 4. Pruebas unitarias

Una prueba unitaria verifica una sola unidad (función, servicio, controlador con dependencias mockeadas, componente) sin red ni base de datos.

### Backend

| ID | Archivo | Escenario | Resultado esperado |
| --- | --- | --- | --- |
| UT-B-01 | `health.service.spec.ts` | Camino exitoso con reloj fijo | `estado=ok`, `servicio=tfi-back`, ISO fijo |
| UT-B-02 | `health.service.spec.ts` | Límite: formato ISO | Regex con milisegundos y `Z` |
| UT-B-03 | `health.service.spec.ts` | Error: `toISOString` falla | Se propaga la excepción |
| UT-B-04 | `health.controller.spec.ts` | Éxito con `HealthService` mock | Delega 1 vez y retorna el mock |
| UT-B-05 | `health.controller.spec.ts` | Límite: marca vacía | Propaga `""` |
| UT-B-06 | `health.controller.spec.ts` | Error del servicio | Propaga el throw |
| UT-B-07..09 | `environment.validation.spec.ts` | Éxito / producción / inválidos | Acepta o lanza mensaje claro |
| UT-B-10..11 | `http-exception.filter.spec.ts` | 400, 500 prod, valor desconocido | Cuerpo estable, sin secretos |
| UT-B-12 | `configurar-aplicacion.spec.ts` | Pipe: extra / vacío / válido | Rechazo o aceptación |

**Aislamiento:** el controlador unitario no usa el `HealthService` real; recibe un `useValue` con `jest.fn()`. El filtro usa un `ArgumentsHost` artificial. No hay Internet ni Postgres.

### Frontend

| ID | Archivo | Escenario | Resultado esperado |
| --- | --- | --- | --- |
| UT-F-01 | `encabezado-institucional.test.tsx` | Render institucional | Nombre + etapa visibles |
| UT-F-02 | `encabezado-institucional.test.tsx` | Sin métricas inventadas | No hay dashboard/login |
| UT-F-03 | `marco-aplicacion.test.tsx` / `pie-institucional.test.tsx` | Layout | Contenido, pie y skip-link |
| UT-F-04 | `entorno-publico.test.ts` | URL pública | Lectura / normalización / error |
| UT-F-05 | `cliente-http.test.ts` | fetch mock: 200, 204, 404, 401, red | Contratos `ErrorApi` / JSON |

**Mocks:** `fetch` se stubbea con `vi.stubGlobal`. Nunca se llama al backend real desde estas unitarias.

## 5. Pruebas de integración

Archivo: `TFI-Back/src/modules/health/health.integration.spec.ts`

**Participan:** `HealthModule` → `HealthController` → `HealthService` → adaptador HTTP Express de Nest.

**Reales:** módulo, controlador, servicio, enrutamiento y serialización JSON.  
**Simulado:** nada del dominio del módulo; solo se usa un *spy* para observar que el servicio fue llamado (no se reemplaza la implementación).

### Paso a paso

1. `Test.createTestingModule({ imports: [HealthModule] }).compile()`
2. `createNestApplication()` + `setGlobalPrefix('api/v1')` + `init()`
3. Obtener `HealthService` del contenedor y registrar `jest.spyOn(servicio, 'obtenerEstado')`
4. `request(server).get('/api/v1/health').expect(200)`
5. Verificar que el spy se invocó una vez y que el body cumple el contrato

También se comprueba que el contenedor resuelve instancias reales de controlador y servicio.

## 6. Pruebas funcionales / E2E

Archivo: `TFI-Back/test/app.e2e-spec.ts`

Una prueba E2E recorre un flujo completo. En este proyecto el flujo disponible es técnico:

### Flujo `GET /api/v1/health`

1. Se inicializa Nest con `AppModule` (incluye `ConfigModule` + `HealthModule`).
2. Se aplica `configurarAplicacion` (prefijo, Helmet, CORS, ValidationPipe, filtro, Swagger).
3. Supertest envía `GET /api/v1/health`.
4. El router de Nest resuelve `HealthController`.
5. El controlador llama a `HealthService.obtenerEstado()`.
6. La respuesta HTTP es 200 con JSON `{ estado, servicio, marcaDeTiempo }`.
7. Se valida Content-Type, CORS hacia `http://localhost:3000` y ausencia de `stack`/`token`/`password`.

Flujos adicionales E2E técnicos:

- 404 con cuerpo de error estable.
- OpenAPI en `/api/v1/docs-json` incluye `/api/v1/health`.

**Aclaración obligatoria:** estas pruebas verifican el flujo técnico del scaffolding. **No** verifican gestión de obras, actas, movimientos ni el visor GIS.

## 7. Pruebas del frontend

Se implementaron con Vitest + React Testing Library sobre componentes y utilidades reales:

- Layout institucional (encabezado, marco, pie).
- Lectura de `NEXT_PUBLIC_API_URL`.
- Cliente HTTP preparado (sin llamadas reales).

No hay pruebas E2E de navegador: no hay flujo de negocio en UI ni herramienta e2e instalada.

La página inicial (`app/page.tsx`) es un Server Component; la verificación de presentación se centra en el layout reutilizable, que es la lógica de UI comprobable hoy.

## 8. Cómo ejecutar las pruebas

### Requisitos previos

- Node.js compatible: backend pide `>=24.9.0` (en esta máquina: 26.13.0 vía `nvm use 26.13.0`).
- npm.
- Dependencias instaladas con `npm ci` o `npm install` en cada repo.
- Backend tests: variables `NODE_ENV=test`, `PORT=3001`, `FRONTEND_URL=http://localhost:3000` (también las setea `test/setup-env.cjs`).
- Frontend: no exige `.env.local` para las unitarias; los tests setean `NEXT_PUBLIC_API_URL` cuando hace falta.

### Backend (`TFI-Back`)

```powershell
cd TFI-Back
nvm use 26.13.0
npm ci

$env:NODE_ENV = "test"
$env:PORT = "3001"
$env:FRONTEND_URL = "http://localhost:3000"
$env:SWAGGER_ENABLED = "true"

npm run test:unit          # unitarias
npm run test:integration   # integración HealthModule
npm run test:e2e           # E2E técnico AppModule
npm run test:all           # unit + integration + e2e
npm run lint
npm run typecheck
npm run build              # preferible sin NODE_ENV=test
```

### Frontend (`TFI-Front`)

```powershell
cd TFI-Front
nvm use 26.13.0
npm ci

npm test                   # equivale a test:unit / test:all
npm run test:watch         # modo observación
npm run lint
npm run typecheck
npm run build
```

Todos los scripts anteriores existen en los `package.json` correspondientes.

## 9. Cómo interpretar los resultados

| Salida | Significado |
| --- | --- |
| PASS / ✓ | La aserción se cumplió |
| FAIL / × | Hubo diferencia entre esperado y obtenido |
| SKIP | Prueba omitida (esta suite no usa skips) |
| Test Suites | Archivos de prueba |
| Tests Passed/Failed | Cantidad de casos |

Ejemplo de salida esperada (backend unitarias):

```text
Test Suites: 5 passed, 5 total
Tests:       18 passed, 18 total
```

Ejemplo de salida real obtenida el 13/11/2026 (frontend):

```text
Test Files  5 passed (5)
     Tests  17 passed (17)
```

Si una prueba falla:

1. Leer el nombre del archivo y el `describe`/`it`.
2. Revisar el diff Expected vs Received.
3. Abrir el archivo en la línea indicada por el stack.
4. Corregir el código o la expectativa (nunca bajar el tipado para “hacer pasar”).

## 10. Matriz de trazabilidad

| Requisito | Caso de prueba | Nivel | Archivo | Estado |
| --- | --- | --- | --- | --- |
| REQ-01 Salud del servicio | UT-B-01..03 | Unitario | `health.service.spec.ts` | PASS |
| REQ-02 Delegación del controlador | UT-B-04..06 | Unitario | `health.controller.spec.ts` | PASS |
| REQ-03 Integración HealthModule | IT-B-01..02 | Integración | `health.integration.spec.ts` | PASS |
| REQ-04 Contrato HTTP de salud | E2E-B-01..02 | E2E técnico | `test/app.e2e-spec.ts` | PASS |
| REQ-05 Error 404 consistente | E2E-B-03 | E2E técnico | `test/app.e2e-spec.ts` | PASS |
| REQ-06 Validación de entorno | UT-B-07..09 | Unitario | `environment.validation.spec.ts` | PASS |
| REQ-07 ValidationPipe | UT-B-12 | Unitario | `configurar-aplicacion.spec.ts` | PASS |
| REQ-08 Errores seguros | UT-B-10..11 | Unitario | `http-exception.filter.spec.ts` | PASS |
| REQ-09 OpenAPI salud | E2E-B-04 | E2E técnico | `test/app.e2e-spec.ts` | PASS |
| REQ-10 Layout institucional | UT-F-01..03 | Unitario | layout `*.test.tsx` | PASS |
| REQ-11 Cliente HTTP | UT-F-05 | Unitario | `cliente-http.test.ts` | PASS |
| REQ-12 Entorno público | UT-F-04 | Unitario | `entorno-publico.test.ts` | PASS |

## 11. Limitaciones actuales

Todavía no pueden probarse, porque no existen en código:

- Autenticación y autorización.
- CRUD de recursos / estaciones.
- Actas, movimientos, solicitudes, reparaciones.
- Persistencia PostgreSQL/PostGIS.
- Integración GIS con Leaflet.
- Roles, permisos y auditoría.

Presentar cualquiera de esos ítems como “verificado” sería incorrecto.

## 12. Relación con el próximo Trabajo Práctico

Esta suite sirve de red de seguridad para refactorizaciones (TP de refactor / code review) y para CI:

- Cada módulo nuevo debería agregar unitarias de su servicio y, cuando haya HTTP, integración o E2E del endpoint.
- Un cambio que rompa el contrato de `/api/v1/health` o el layout institucional fallará en CI antes de llegar a `main`.

## 13. Conclusión

La suite aporta evidencia concreta de que el scaffolding funciona: 41 pruebas reales en verde (18 unitarias backend + 2 integración + 4 E2E + 17 frontend).

El nivel de confianza es alto para la Etapa 1 y deliberadamente limitado respecto del dominio institucional futuro. Lo verificado es la base técnica; lo pendiente es el negocio del Gestor GIS.
