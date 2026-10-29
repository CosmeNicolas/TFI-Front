import { afterEach, describe, expect, it } from "vitest";
import { leerUrlApi, obtenerUrlApi } from "@/config/entorno-publico";

const ORIGINAL = process.env.NEXT_PUBLIC_API_URL;

afterEach(() => {
  if (ORIGINAL === undefined) {
    delete process.env.NEXT_PUBLIC_API_URL;
  } else {
    process.env.NEXT_PUBLIC_API_URL = ORIGINAL;
  }
});

describe("entorno público", () => {
  it("lee la URL si está definida", () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001/api/v1";
    expect(leerUrlApi()).toBe("http://localhost:3001/api/v1");
  });

  it("trata un valor vacío como ausente", () => {
    process.env.NEXT_PUBLIC_API_URL = "   ";
    expect(leerUrlApi()).toBeUndefined();
  });

  it("quita la barra final al obtener la URL", () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001/api/v1/";
    expect(obtenerUrlApi()).toBe("http://localhost:3001/api/v1");
  });

  it("rechaza una URL que no es http o https", () => {
    process.env.NEXT_PUBLIC_API_URL = "ftp://localhost/api";
    expect(() => obtenerUrlApi()).toThrow(/http o https/);
  });

  it("falla con un mensaje claro si falta la variable", () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    expect(() => obtenerUrlApi()).toThrow(/NEXT_PUBLIC_API_URL/);
  });
});
