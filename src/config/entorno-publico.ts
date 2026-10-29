const CLAVE_URL_API = "NEXT_PUBLIC_API_URL";

export function leerUrlApi(): string | undefined {
  const valor = process.env.NEXT_PUBLIC_API_URL?.trim();
  return valor === "" ? undefined : valor;
}

export function obtenerUrlApi(): string {
  const valor = leerUrlApi();

  if (!valor) {
    throw new Error(
      `Falta la variable pública ${CLAVE_URL_API}. Definila en .env.local a partir de .env.example.`,
    );
  }

  try {
    const url = new URL(valor);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("protocolo");
    }
  } catch {
    throw new Error(
      `${CLAVE_URL_API} debe ser una URL http o https absoluta, por ejemplo http://localhost:3001/api/v1`,
    );
  }

  return valor.replace(/\/+$/, "");
}
