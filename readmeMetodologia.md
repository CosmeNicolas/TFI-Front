# Metodología de implementación — Gestor de Seguimiento 

Documento de la Unidad 6 (Buenas prácticas de implementación) aplicado al Trabajo Final **Gestor de Seguimiento Comunicaciones**.

Repositorios:

- `TFI-Back`: API NestJS (`/api/v1`).
- `TFI-Front`: interfaz Next.js (App Router).

La idea central de la unidad es que el código no debe limitarse a funcionar hoy: debe poder entenderse, probarse y modificarse mañana sin introducir riesgos innecesarios. En este proyecto esa idea se usa desde el scaffolding, antes de los módulos de negocio.

---

## 1. Código limpio

El código limpio es aquel que otra persona puede leer y entender sin que el autor esté presente para explicarlo. El objetivo es reducir el costo y el riesgo de mantener el software.

### Características

- **Nombres expresivos:** variables, funciones y clases indican qué representan o qué hacen.
- **Funciones pequeñas:** cada una tiene una responsabilidad clara.
- **Comentarios útiles:** explican decisiones o reglas que el código no muestra por sí solo. Un buen nombre suele alcanzar más que un comentario que repite la instrucción.
- **Evitar duplicaciones:** una misma regla de negocio no debería vivir en varios lugares.
- **Alta cohesión:** los elementos de una función, clase o módulo están relacionados.
- **Bajo acoplamiento:** un módulo depende lo menos posible de los detalles internos de otros.

### Ejemplo de la unidad

Poco claro:

```javascript
function rt(s, c, f, h) {
  const x = s.cuota;
  if (x.pagada === true) {
    c.turnos.push({ fecha: f, hora: h });
  }
}
```

Más claro:

```javascript
function reservarTurno(socio, cancha, fecha, horario) {
  const cuotaAlDia =
    socio.cuota.pagada && socio.cuota.mes === mesActual();

  if (!cuotaAlDia) {
    return false;
  }

  cancha.turnos.push({
    fecha,
    hora: horario,
    socioId: socio.id,
  });

  return true;
}
```

La segunda versión comunica la intención con los nombres y evita comparaciones innecesarias como `=== true`.

### Cómo se adapta al Gestor GIS

El dominio se nombra en español. El framework y las librerías quedan en inglés.

| Poco expresivo | En este proyecto |
| --- | --- |
| `rt(s, c)` | `registrarMovimiento`, `validarTransicionEstado`, `recursoSeleccionado` |
| `x.pagada === true` | `cuotaAlDia(socio)` en el ejemplo de la unidad; acá, cuando exista, `recursoDisponible(recurso)` o `solicitudPuedePasarA(estado)` |
| Un `controller` que valida, consulta SQL y arma el PDF | El controlador HTTP solo recibe el contrato y delega |

Aplicado en la Etapa 1:

- Backend: `HealthController` responde; `HealthService` arma el estado; `HttpExceptionFilter` traduce errores; `validarEntorno` falla al arrancar si falta una variable.
- Frontend: `EncabezadoInstitucional` no conoce el cliente HTTP; `solicitarJson` no conoce recursos ni actas; `leerUrlApi` no dispara pedidos.

Todavía no hay `reservarTurno` de negocio. Cuando exista `registrarMovimiento`, la función no debería validar el permiso, persistir el acta, mover el recurso y enviar un correo en el mismo bloque.

---

## 2. SOLID

SOLID reúne cinco principios de diseño orientado a objetos. Ayudan a que el sistema soporte cambios sin volverse cada vez más difícil de mantener.

**Advertencia de la unidad:** SOLID no significa agregar abstracciones para todo. Aplicarlo sin necesidad genera sobreingeniería. En este TFI se usa el principio cuando hay un motivo real (probar, sustituir una integración, extender un comportamiento que ya varía). No se crean interfaces con una sola implementación “por si acaso”.

### S — Responsabilidad única

Una clase o función debería tener un solo motivo principal para cambiar.

En la unidad: separar la validación de la cuota, la reserva del turno y el envío de la notificación.

En el Gestor GIS:

| Componente | Motivo para cambiar |
| --- | --- |
| `HealthController` | El contrato HTTP de salud |
| `validarEntorno` | Qué variables son obligatorias |
| `HttpExceptionFilter` | Cómo se muestra un error al cliente |
| `cliente-http.ts` | Transporte (timeout, 401, JSON) |
| Un futuro `ActaService` | Reglas del acta, no el SQL ni el correo |

Si `registrarMovimiento` valida el estado, escribe en tres tablas, genera un PDF y notifica, hay varios motivos de cambio en el mismo lugar. Hay que partirlo.

### O — Abierto / cerrado

El código debe estar abierto a extensiones y cerrado a modificaciones innecesarias de lo que ya funciona.

En la unidad: nuevos tipos de descuento sin reescribir toda la función que calcula la cuota.

En el Gestor GIS:

- El backend es un **monolito modular**: un módulo nuevo (reparaciones, solicitudes) se agrega sin reescribir `HealthModule` ni el filtro HTTP.
- El visor GIS, cuando exista, no debería obligar a cambiar el cliente HTTP: consume `solicitarJson`.
- Los tipos de acta o de pedido, cuando se definan, no deberían vivir como un `if/else` interminable en un solo servicio si cada tipo cambia por razones distintas. Ahí puede aparecer un Strategy. Hoy no hay tipos: no se fabrica esa jerarquía de antemano (YAGNI).

### L — Sustitución de Liskov

Una subclase debe poder usarse en lugar de su clase base sin romper el contrato.

En la unidad: un socio honorario respeta los métodos de `Socio`, aunque pague la cuota con otra regla.

En el Gestor GIS todavía no hay herencia de dominio. Cuando aparezcan especializaciones (`SolicitudDeProvision`, `SolicitudDeReparacion`), ambas tienen que poder tratarse como solicitud: identificar dependencia, transicionar estado, auditar. Una subclase que ignore el estado o que persista por fuera de la transacción rompería el contrato.

En el frontend, un componente de mapa no puede “parecer” una tabla: si la página espera `recursoSeleccionado`, el mapa tiene que notificar la misma selección.

### I — Segregación de interfaces

Mejor una interfaz pequeña y específica que una grande que obligue a implementar métodos de más.

En la unidad: un módulo que solo envía correos no debería implementar SMS, WhatsApp y push.

En el Gestor GIS:

- El cliente HTTP solo pide JSON. No mezcla Storage, Auth ni PostGIS.
- shadcn/ui: se instalaron Button, Card y Badge porque se usan. No se importó Table, Sidebar ni Form “para el futuro”.
- Un futuro puerto de persistencia de actas no debería exigir métodos de archivos o de teselas.

### D — Inversión de dependencias

Los módulos de alto nivel no deberían depender de implementaciones concretas de bajo nivel, sino de abstracciones.

En la unidad: el módulo de turnos usa un repositorio de socios, no una planilla Excel concreta.

En el Gestor GIS:

- Las reglas de negocio no deben llamar al SDK de Supabase. La recomendación de la Etapa 2 es PostgreSQL/PostGIS con un acceso SQL (Drizzle o equivalente) y el SDK solo como adaptador de Storage y, si se elige, de autenticación.
- NestJS ya inyecta dependencias: un servicio recibe lo que necesita, y en las pruebas se sustituye.
- El frontend no depende de la forma interna de Nest: depende del contrato JSON (`codigo`, `mensajes`, `estado`).

No se inventó un repositorio genérico por entidad: hoy no hay entidades. La abstracción aparece cuando haya persistencia real que convenga aislar o probar.

---

## 3. DRY — Don't Repeat Yourself

Cada regla de negocio debe tener una única fuente de verdad.

### Ejemplo de la unidad

Si esta condición se copia en la reserva de turnos y en el reporte de morosos:

```javascript
socio.cuota.pagada && socio.cuota.mes === mesActual();
```

el día que cambie la regla hay que tocar dos lugares. Si se olvida uno, el sistema se contradice.

Centralizar:

```javascript
function cuotaAlDia(socio) {
  return socio.cuota.pagada && socio.cuota.mes === mesActual();
}
```

**DRY no significa que nunca se pueda repetir código parecido.** Si dos fragmentos se parecen pero representan reglas distintas que pueden cambiar por separado, unirlos es un error.

### Cómo se adapta al Gestor GIS

Una sola fuente de verdad prevista:

- Transición de estado de un recurso o de una solicitud: una función (`validarTransicionEstado`), no un `if` en el controlador, otro en el servicio y otro en el frontend.
- Autorización por dependencia: el backend decide. El menú oculto en el frontend no es una segunda regla.
- Cuerpo de error HTTP: el filtro del backend y el cliente HTTP del frontend hablan el mismo contrato (`codigo`, `mensajes`). No se inventa un formato distinto por pantalla.
- URL del API: `NEXT_PUBLIC_API_URL` en un solo módulo de configuración.

Lo que no se unifica todavía:

- No hay un “Card genérico de módulo” porque recursos y actas todavía no existen.
- No hay un `Repository<T>` para todas las tablas: sería DRY falso (la misma forma, reglas distintas).

---

## 4. YAGNI — You Aren't Gonna Need It

No implementar funcionalidades especulativas que nadie pidió.

En la unidad: un club con una sola sede no necesita, desde el día uno, parámetros y tablas para múltiples sedes.

YAGNI no ignora el futuro: deja el código claro para incorporar el cambio cuando sea un requisito.

### Cómo se adapta al Gestor GIS

La Etapa 1 es el ejemplo más directo.

| Se podría haber armado “por las dudas” | Qué se hizo |
| --- | --- |
| Login, JWT, roles | No. Falta el contrato de sesión con el backend. |
| CRUD de recursos y actas | No. Falta el modelo de datos. |
| Leaflet, marcadores y coordenadas de ejemplo | No. No se inventan geometrías. |
| Cliente de Supabase y ORM a la vez | No. La estrategia se confirma en la Etapa 2. |
| Rate limiting, microservicios, React Query | No. Un solo endpoint de salud no lo justifica. |
| Carpetas vacías `hooks/`, `guards/`, `modules/actas` | No. Se documentan hasta que tengan archivos reales. |

Lo que sí se dejó preparado, sin simular que ya existe:

- Prefijo `/api/v1` y validación global.
- Cliente HTTP con timeout y lectura de 401/403, **sin llamarlo**.
- Tokens de color institucionales.
- Documentación GIS y de Storage.

Eso no es YAGNI violado: es diseño para cambiar. Violación sería un dashboard con métricas inventadas o un mapa con puntos ficticios.

---

## 5. Revisión de código

La revisión no se limita a comprobar que el programa compile. Evalúa la calidad del diseño, normalmente en un Pull Request antes de entrar a `main`.

### Qué revisar (unidad + este proyecto)

- ¿Los nombres dicen qué es un recurso, un acta o una solicitud?
- ¿Cada función tiene una responsabilidad?
- ¿La misma regla de estado está copiada en el front y en el back? (DRY)
- ¿Se agregó un mapa, un login o un ORM que nadie pidió en esta etapa? (YAGNI)
- ¿Un módulo nuevo obliga a reescribir el de salud? (OCP)
- ¿El frontend autoriza solo escondiendo botones?
- ¿Hay secretos, tokens o `.env` en el commit?
- ¿Los comentarios explican una decisión (por ejemplo, no usar el SDK de Supabase para PostGIS) o repiten el código?

### Observación útil

Poco útil: «Esta función está mal».

Útil: «`registrarMovimiento` valida el estado, persiste el acta, actualiza el recurso y envía un correo. Separar esas responsabilidades permite probar la transición de estado sin SMTP y evita que un cambio en las notificaciones rompa la integridad del movimiento».

### Criterio

- **Aceptar:** los problemas se corrigieron o las observaciones pendientes están justificadas.
- **Pedir cambios:** hay un problema de diseño o de legibilidad que debe entrar corregido.
- **Bloquear:** el cambio introduce un riesgo real (secreto en el repo, endpoint sin autorización, coordenadas sin validar).
- **Sugerencia:** mejora, pero no impide integrar.

Se evalúa el código, no a quien lo escribió.

En este TFI el flujo previsto es `feature/…` o `fix/…` → PR → CI (lint, tipos, tests, build) → revisión → `main`. El workflow de GitHub Actions no usa credenciales de producción.

---

## 6. Conceptos que hay que distinguir

| Concepto | Significado | En el Gestor GIS |
| --- | --- | --- |
| Cohesión | Qué tan relacionados están los elementos de un módulo | `HealthModule` solo habla de salud |
| Acoplamiento | Cuánto depende un componente de los detalles de otro | El front no conoce Oracle/Supabase; el servicio no arma HTML |
| Duplicación | La misma regla en varios sitios | El estado de una solicitud no se valida distinto en la tabla y en el mapa |
| Refactorización | Mejorar la estructura sin cambiar el comportamiento | Extraer `validarEntorno` no cambia qué variables hacen falta |
| Sobreingeniería | Complejidad que no se justifica | Microservicios, repositorio genérico, mapa vacío con Leaflet |
| Responsabilidad única | Un solo motivo principal para cambiar | Filtro de errores ≠ módulo de actas |
| Pull Request | Pedir revisión e integrar una rama | Condición para entrar a `main` |

Una buena implementación busca **alta cohesión y bajo acoplamiento**.

---

## 7. Relación con el Trabajo Práctico N.º 3

El TP 3 pide seleccionar, diagnosticar, refactorizar, documentar, abrir un PR y responder la revisión.

Candidatos reales de este proyecto, cuando haya código de negocio:

1. Un servicio que mezcle validación de estado, persistencia y notificación.
2. Una página del visor que consulte la API, filtre y dibuje el mapa en el mismo componente cliente.
3. Una regla `recursoDisponible` copiada en movimientos y en solicitudes.

Mientras tanto, el scaffolding ya se escribió para no tener que desarmar un “dios” más adelante: controladores flacos, cliente HTTP sin dominio, sin datos ficticios.

El resultado esperado de un refactor del TP: el comportamiento externo no cambia (mismos códigos HTTP, misma pantalla) y la estructura interna queda más clara.

---

## 8. Ejemplo integrador (parcial) aplicado al TFI

Imaginá una función de etapa futura:

```javascript
function registrar(recurso, acta, sede, descuento, excel) {
  if (recurso.estado == "ok" || recurso.estado == "OK") { /* ... */ }
  excel.guardar(acta);
  enviarMail(acta);
  if (sede === "otra") { /* nadie pidió varias sedes */ }
}
```

Problemas y criterio:

| Principio | Qué se ve | Corrección razonable |
| --- | --- | --- |
| Código limpio | `registrar`, `== "ok"` | `registrarMovimiento`, estados del dominio, sin magia |
| SRP | Valida, persiste, mail y sedes | Partir en validar / persistir / notificar |
| DRY | El estado se compara distinto en otro archivo | `validarTransicionEstado` |
| YAGNI | `sede === "otra"` | Sacar sedes hasta que sean requisito |
| OCP | Cada descuento o tipo de acta toca la misma función | Extensión cuando los tipos realmente varíen |
| DIP | Dependencia directa de `excel` | Puerto de persistencia; hoy, PostgreSQL, no el SDK de Storage |
| Code Review | Pedir el cambio con el motivo | No integrar hasta que la transacción cubra acta + recurso |

No hace falta aplicar los cinco principios a la vez. Se identifica el problema real y se elige el criterio de menor complejidad razonable.

---

## 9. Qué recordar

- **Código limpio:** escribir para que otros entiendan y mantengan.
- **SOLID:** componentes que soportan cambios sin romper el resto; sin abstracciones de adorno.
- **DRY:** una sola versión de cada regla de negocio.
- **YAGNI:** no construir lo especulativo (login, mapa, CRUD) antes de la etapa que lo pide.
- **Code Review:** la calidad es responsabilidad compartida, vía Pull Request.
- **Refactorización:** mejorar la estructura sin cambiar el comportamiento externo.

En el Gestor GIS eso se traduce así: el backend es la autoridad de reglas y permisos; el frontend muestra y captura; PostgreSQL/PostGIS guarda; Supabase no es el dominio. Cada etapa suma un módulo cohesivo, no una función que hace de todo.

---

## 10. Lectura complementaria en los repositorios

- `TFI-Back/README.md`: arquitectura, seguridad, decisión de acceso a datos.
- `TFI-Back/docs/decision-acceso-datos.md`: por qué no acoplar el negocio al SDK de Supabase (DIP).
- `TFI-Front/README.md`: convenciones de componentes, YAGNI del visor.
- `TFI-Front/docs/cliente-http.md` y `docs/preparacion-gis.md`: transporte separado del mapa.
