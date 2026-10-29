export interface RespuestaErrorApi {
  codigo: number;
  error: string;
  mensajes: string[];
  ruta: string;
  marcaDeTiempo: string;
}

export interface OpcionesSolicitud {
  metodo?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  cuerpo?: unknown;
  encabezados?: HeadersInit;
  senal?: AbortSignal;
  tiempoDeEsperaMs?: number;
}
