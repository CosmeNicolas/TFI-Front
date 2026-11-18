# Reporte de verificación — TP N.º 4

**Proyecto:** Gestor GIS — Gestión y Seguimiento de Obras San Juan  
**Fecha de ejecución:** 13 de noviembre de 2026  
**Repos:** NestJS 12 (`TFI-Back`) · Next.js 16 (`TFI-Front`)  
**Entorno de ejecución:** Windows · Node.js v26.13.0 · npm 11.20.0

---

## 1. Introducción

Este informe documenta la suite de pruebas automatizadas del Trabajo Práctico N.º 4 (Suite de Pruebas y Verificación del Producto) sobre el scaffolding existente del Gestor GIS.

El objetivo de la verificación es demostrar, con evidencia ejecutable, que el código real de la Etapa 1 se comporta como se espera antes de incorporar módulos de negocio. No se verificaron procesos institucionales inexistentes (login, CRUD, GIS, actas, movimientos).

## 2. Alcance

### Verificado

| Área | Qué se cubrió |
| --- | --- |
| Backend — salud | `HealthService`, `HealthController`, `HealthModule` |
| Backend — configuración | `validarEntorno` |
| Backend — errores | `HttpExceptionFilter` |
| Backend — validación HTTP | `ValidationPipe` global (`crearPipeValidacion`) |
| Backend — flujo HTTP | `GET /api/v1/health`, 404, OpenAPI |
| Frontend — layout | Encabezado, pie, marco |
| Frontend — entorno | `NEXT_PUBLIC_API_URL` |
| Frontend — cliente HTTP | `solicitarJson` / `componerUrlApi` (con `fetch` mockeado) |

### Fuera de alcance

- Autenticación y autorización.
- CRUD de recursos, actas, movimientos, solicitudes, reparaciones.
- PostgreSQL / PostGIS / Supabase.
- Visor GIS (Leaflet / OpenStreetMap).
- Roles, permisos y auditoría.
- Pruebas E2E de interfaz en navegador (Playwright/Cypress no forman parte del stack actual).

## 3. Requerimientos seleccionados

Los requisitos se derivan del comportamiento real implementado en la Etapa 1:

| ID | Requisito |
| --- | --- |
| REQ-01 | El servicio de salud informa estado `ok`, servicio `tfi-back` y marca de tiempo ISO. |
| REQ-02 | El controlador de salud delega en el servicio y propaga su resultado o su error. |
| REQ-03 | `HealthModule` integra controlador y servicio a través de Nest y responde por HTTP. |
| REQ-04 | La API expone `GET /api/v1/health` con contrato JSON estable. |
| REQ-05 | Las rutas inexistentes responden con cuerpo de error sin stack. |
| REQ-06 | La configuración de entorno se valida al iniciar y rechaza valores inválidos. |
| REQ-07 | El `ValidationPipe` global rechaza propiedades no declaradas y campos vacíos. |
| REQ-08 | Los errores internos en producción no exponen detalles sensibles. |
| REQ-09 | Swagger documenta el endpoint de salud cuando está habilitado. |
| REQ-10 | El layout institucional identifica el sistema y no inventa métricas. |
| REQ-11 | El cliente HTTP compone URLs, interpreta errores del backend y no llama red real en tests. |
| REQ-12 | Las variables públicas del frontend se leen y validan de forma segura. |

## 4. Estrategia de testing

### Testing unitario

Verifica una unidad aislada (servicio, controlador con mock, función pura, filtro, pipe, utilidad). No usa base de datos ni red.

**Herramientas:** Jest 30 + `@nestjs/testing` (backend); Vitest 5 + React Testing Library (frontend).

### Testing de integración

Verifica la colaboración real entre dos o más componentes del mismo proceso. En este TP: `HealthModule` + `HealthController` + `HealthService` + adaptador HTTP de Nest, sin mockear el servicio.

**Herramientas:** Jest + `@nestjs/testing` + Supertest.

### Testing funcional / E2E técnico

Recorre el flujo HTTP completo de la aplicación NestJS (AppModule + configuración global) desde la solicitud hasta la respuesta. Es un E2E técnico del endpoint disponible; **no** es un E2E de un proceso de negocio del Gestor GIS.

**Herramientas:** Jest + Supertest + AppModule real.

## 5. Casos de prueba

| ID | Requisito | Nivel | Escenario | Resultado esperado | Resultado obtenido |
| --- | --- | --- | --- | --- | --- |
| UT-B-01 | REQ-01 | Unitario | `HealthService` con reloj fijo | `{ estado: 'ok', servicio: 'tfi-back', marcaDeTiempo ISO }` | PASS |
| UT-B-02 | REQ-01 | Unitario | Formato ISO de la marca de tiempo | Regex ISO con milisegundos y `Z` | PASS |
| UT-B-03 | REQ-01 | Unitario | `Date.toISOString` falla | Se propaga la excepción | PASS |
| UT-B-04 | REQ-02 | Unitario | Controlador con servicio mockeado exitoso | Delega y retorna la respuesta del mock | PASS |
| UT-B-05 | REQ-02 | Unitario | Servicio entrega marca vacía | El controlador la propaga | PASS |
| UT-B-06 | REQ-02 | Unitario | Servicio lanza error | El controlador propaga el error | PASS |
| UT-B-07 | REQ-06 | Unitario | Entorno mínimo válido | Normaliza origen y habilita Swagger | PASS |
| UT-B-08 | REQ-06 | Unitario | Producción sin `SWAGGER_ENABLED` | Swagger desactivado | PASS |
| UT-B-09 | REQ-06 | Unitario | Puerto 0 / URL con ruta o credenciales | Lanza error descriptivo | PASS |
| UT-B-10 | REQ-08 | Unitario | Error 500 en producción | Mensaje genérico, sin stack ni detalle | PASS |
| UT-B-11 | REQ-08 | Unitario | Excepción desconocida (string) | 500 genérico | PASS |
| UT-B-12 | REQ-07 | Unitario | Propiedad extra / nombre vacío | `BadRequestException` | PASS |
| IT-B-01 | REQ-03 | Integración | HealthModule inicializa dependencias | Controller y Service reales disponibles | PASS |
| IT-B-02 | REQ-03 | Integración | GET `/api/v1/health` vía HealthModule | 200 + JSON + spy del servicio llamado | PASS |
| E2E-B-01 | REQ-04 | E2E técnico | GET `/api/v1/health` con AppModule | 200, contrato completo, CORS | PASS |
| E2E-B-02 | REQ-04 | E2E técnico | Respuesta sin campos sensibles | Solo `estado`, `servicio`, `marcaDeTiempo` | PASS |
| E2E-B-03 | REQ-05 | E2E técnico | GET ruta inexistente | 404 con cuerpo estable, sin stack | PASS |
| E2E-B-04 | REQ-09 | E2E técnico | GET `/api/v1/docs-json` | Incluye path `/api/v1/health` | PASS |
| UT-F-01 | REQ-10 | Unitario | Encabezado institucional | Muestra nombre y etapa | PASS |
| UT-F-02 | REQ-10 | Unitario | Encabezado sin métricas inventadas | No hay dashboard ni login | PASS |
| UT-F-03 | REQ-10 | Unitario | Marco y pie | Renderizan contenido y accesibilidad | PASS |
| UT-F-04 | REQ-12 | Unitario | URL pública válida / vacía / inválida | Lectura, normalización o error | PASS |
| UT-F-05 | REQ-11 | Unitario | `solicitarJson` exitoso / 204 / 404 / 401 / red | Contratos del cliente HTTP | PASS |

## 6. Resultados de ejecución

Ejecución real del 13/11/2026:

| Suite | Comando | Suites / archivos | Tests | Fallidos | Omitidos |
| --- | --- | --- | --- | --- | --- |
| Backend unitarias | `npm run test:unit` | 5 passed | 18 passed | 0 | 0 |
| Backend integración | `npm run test:integration` | 1 passed | 2 passed | 0 | 0 |
| Backend E2E | `npm run test:e2e` | 1 passed | 4 passed | 0 | 0 |
| Frontend unitarias | `npm test` | 5 passed | 17 passed | 0 | 0 |
| **Total** | | **12** | **41** | **0** | **0** |

Calidad asociada (también ejecutada):

| Check | Backend | Frontend |
| --- | --- | --- |
| Lint | PASS | PASS |
| Typecheck | PASS | PASS |

No se declara porcentaje de cobertura: la métrica no se usó como criterio de aceptación de este TP.

### Errores detectados durante la implementación

1. **Jest 30:** `--testPathPattern` fue reemplazado por `--testPathPatterns`. Se corrigió el script `test:integration`.
2. **Frontend — `MarcoAplicacion`:** el segundo test falló por residuales del DOM del test anterior (`Found multiple elements`). Se agregó `cleanup()` en `afterEach` y se acotó la query al render local.

## 7. Evidencia técnica

### Comandos ejecutados

```bash
# Backend
cd TFI-Back
nvm use 26.13.0
# Variables: NODE_ENV=test PORT=3001 FRONTEND_URL=http://localhost:3000 SWAGGER_ENABLED=true
npm run test:unit
npm run test:integration
npm run test:e2e
npm run lint
npm run typecheck

# Frontend
cd TFI-Front
nvm use 26.13.0
npm test
npm run lint
npm run typecheck
```

### Archivos de prueba principales

**Backend**

- `src/modules/health/health.service.spec.ts`
- `src/modules/health/health.controller.spec.ts`
- `src/modules/health/health.integration.spec.ts`
- `src/config/environment.validation.spec.ts`
- `src/common/filters/http-exception.filter.spec.ts`
- `src/configurar-aplicacion.spec.ts`
- `test/app.e2e-spec.ts`

**Frontend**

- `src/components/layout/encabezado-institucional.test.tsx`
- `src/components/layout/marco-aplicacion.test.tsx`
- `src/components/layout/pie-institucional.test.tsx`
- `src/config/entorno-publico.test.ts`
- `src/lib/api/cliente-http.test.ts`

### Evidencia de integración

`health.integration.spec.ts` monta `HealthModule` real, registra un spy sobre `HealthService.obtenerEstado`, realiza `GET /api/v1/health` con Supertest y comprueba que el servicio fue invocado una vez y que el cuerpo JSON cumple el contrato.

### Evidencia E2E técnica

`test/app.e2e-spec.ts` monta `AppModule`, aplica `configurarAplicacion` (prefijo, CORS, validación, filtro, Swagger) y verifica salud, ausencia de campos sensibles, 404 y documento OpenAPI.

## 8. Problemas y correcciones

| Problema | Impacto | Corrección |
| --- | --- | --- |
| Flag de Jest obsoleto en integración | Suite no corría | Usar `--testPathPatterns` |
| DOM residual en Vitest/RTL | 1 test fallido | `cleanup()` + query scoped |
| Tests previos del controlador usaban servicio real | Mezcla unitario/integración | Unitario con mock; integración separada |

## 9. Pendientes

Cuando existan módulos de negocio, ampliar la suite con:

- Transiciones de estado (`validarTransicionEstado`).
- Autorización por dependencia.
- Persistencia con base de prueba controlada.
- Contrato frontend ↔ backend sobre recursos/actas.
- E2E de navegador para el visor GIS (sin inventar coordenadas).

## 10. Conclusión

La suite aporta confianza sobre la base técnica de la Etapa 1: salud del API, validación de entorno, errores consistentes, layout institucional y cliente HTTP. Los 41 tests ejecutados pasaron.

La limitación principal es el alcance del producto: sin dominio de negocio, la verificación no puede afirmar que el Gestor GIS gestiona obras, actas o mapas. Sí puede afirmar que el andamiaje sobre el que se construirán esas funciones responde de forma predecible.

## Uso de Inteligencia Artificial

### Tareas solicitadas a la IA

- Auditar ambos repositorios y las pruebas existentes.
- Completar unitarias (éxito / límite / error), integración y E2E técnico.
- Ampliar pruebas del frontend.
- Ajustar scripts npm y CI.
- Redactar `reporte-verificacion.md` y `Pruebas Integralres tp4.md`.

### Casos propuestos y aceptados

- Unitarias de `HealthService` y `HealthController` con mocks.
- Integración de `HealthModule` con Supertest y spy.
- E2E de `/api/v1/health`, 404 y OpenAPI.
- Frontend: layout, entorno público y cliente HTTP con `fetch` mockeado.

### Código generado o modificado

- Nuevos specs en backend y frontend.
- Scripts `test:unit`, `test:integration`, `test:all`.
- Paso de integración en GitHub Actions del backend.
- Ambos documentos Markdown del TP.

### Sugerencias descartadas o evitadas

- No se implementaron login, CRUD, GIS ni base ficticia “para tener más cobertura”.
- No se agregó Playwright/Cypress: no estaban en el stack y no había flujo de UI de negocio.
- No se inventaron porcentajes de cobertura ni resultados no ejecutados.

### Errores detectados en el proceso asistido

- Fallo real del test de `MarcoAplicacion` por falta de `cleanup`.
- Fallo real del script de integración por el flag de Jest 30.

### Verificación humana / ejecución real

Antes de dar por válido el TP, se ejecutaron en máquina local:

- `npm run test:unit` → 18 PASS  
- `npm run test:integration` → 2 PASS  
- `npm run test:e2e` → 4 PASS  
- `npm test` (frontend) → 17 PASS  
- lint y typecheck en ambos repos → PASS  

La IA asistió en el diseño y la redacción; los resultados se validaron por ejecución real de las suites.
