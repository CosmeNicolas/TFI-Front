import { obtenerUrlApi } from "@/config/entorno-publico";
import type {
  OpcionesSolicitud,
  RespuestaErrorApi,
} from "@/types/respuesta-api";

export class ErrorApi extends Error {
  constructor(
    public readonly codigo: number,
    public readonly mensajes: string[],
  ) {
    super(mensajes.join(" "));
    this.name = "ErrorApi";
  }
}

const TIEMPO_DE_ESPERA_MS = 10_000;

export function componerUrlApi(ruta: string, base = obtenerUrlApi()): string {
  if (!ruta.startsWith("/")) {
    throw new Error("La ruta de la API debe comenzar con /");
  }

  return `${base}${ruta}`;
}

export async function solicitarJson<T>(
  ruta: string,
  opciones: OpcionesSolicitud = {},
): Promise<T> {
  const controlador = new AbortController();
  const tiempoDeEspera = opciones.tiempoDeEsperaMs ?? TIEMPO_DE_ESPERA_MS;
  const temporizador = setTimeout(() => {
    controlador.abort();
  }, tiempoDeEspera);

  const senal = opciones.senal
    ? AbortSignal.any([opciones.senal, controlador.signal])
    : controlador.signal;

  try {
    const respuesta = await fetch(componerUrlApi(ruta), {
      method: opciones.metodo ?? "GET",
      headers: {
        Accept: "application/json",
        ...(opciones.cuerpo === undefined
          ? {}
          : { "Content-Type": "application/json" }),
        ...opciones.encabezados,
      },
      body:
        opciones.cuerpo === undefined
          ? undefined
          : JSON.stringify(opciones.cuerpo),
      signal: senal,
    });

    return interpretarRespuesta<T>(respuesta);
  } catch (error) {
    if (error instanceof ErrorApi) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ErrorApi(408, ["La solicitud superó el tiempo de espera"]);
    }

    throw new ErrorApi(0, ["No se pudo contactar al backend"]);
  } finally {
    clearTimeout(temporizador);
  }
}

async function interpretarRespuesta<T>(respuesta: Response): Promise<T> {
  if (respuesta.status === 204) {
    return undefined as T;
  }

  const contenido = await respuesta.text();
  const datos = contenido === "" ? undefined : parsearJson(contenido);

  if (!respuesta.ok) {
    throw new ErrorApi(
      respuesta.status,
      mensajesDeError(datos, respuesta.status),
    );
  }

  return datos as T;
}

function parsearJson(contenido: string): unknown {
  try {
    return JSON.parse(contenido);
  } catch {
    throw new ErrorApi(502, ["El backend respondió un cuerpo que no es JSON"]);
  }
}

function mensajesDeError(datos: unknown, codigo: number): string[] {
  if (esRespuestaErrorApi(datos) && datos.mensajes.length > 0) {
    return datos.mensajes;
  }

  if (codigo === 401) {
    return ["La sesión no es válida o expiró"];
  }

  if (codigo === 403) {
    return ["No hay permiso para esta operación"];
  }

  return ["El backend rechazó la solicitud"];
}

function esRespuestaErrorApi(datos: unknown): datos is RespuestaErrorApi {
  if (typeof datos !== "object" || datos === null) {
    return false;
  }

  const candidato = datos as Partial<RespuestaErrorApi>;
  return Array.isArray(candidato.mensajes);
}
