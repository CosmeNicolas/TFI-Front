# Cliente HTTP

`src/lib/api/cliente-http.ts` centraliza las llamadas futuras a NestJS.

Hoy:

- Compone la URL a partir de `NEXT_PUBLIC_API_URL`.
- Tipa la respuesta.
- Interpreta el cuerpo de error del backend (`codigo`, `mensajes`).
- Aplica un tiempo de espera.
- Acepta una señal de cancelación.

Todavía no:

- No llama ningún endpoint desde la interfaz.
- No guarda ni envía tokens.
- No redirige ante 401 o 403: solo traduce el código a un mensaje. La sesión se define en la Etapa 3.

No poner reglas de negocio en este módulo. Un caso de uso (`buscarEstaciones`, `registrarMovimiento`) vive en el módulo correspondiente y usa `solicitarJson`.
