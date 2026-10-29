import { afterEach, describe, expect, it, vi } from "vitest";
import {
  componerUrlApi,
  ErrorApi,
  solicitarJson,
} from "@/lib/api/cliente-http";

const ORIGINAL = process.env.NEXT_PUBLIC_API_URL;

afterEach(() => {
  vi.unstubAllGlobals();
  if (ORIGINAL === undefined) {
    delete process.env.NEXT_PUBLIC_API_URL;
  } else {
    process.env.NEXT_PUBLIC_API_URL = ORIGINAL;
  }
});

describe("cliente HTTP", () => {
  it("compone la URL sin duplicar el prefijo", () => {
    expect(componerUrlApi("/health", "http://localhost:3001/api/v1")).toBe(
      "http://localhost:3001/api/v1/health",
    );
  });

  it("rechaza una ruta relativa sin barra inicial", () => {
    expect(() =>
      componerUrlApi("health", "http://localhost:3001/api/v1"),
    ).toThrow(/debe comenzar con \//);
  });

  it("interpreta el cuerpo de error del backend", async () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001/api/v1";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            codigo: 404,
            error: "No encontrado",
            mensajes: ["No encontrado"],
            ruta: "/api/v1/recurso",
            marcaDeTiempo: "2026-10-29T00:00:00.000Z",
          }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    await expect(solicitarJson("/recurso")).rejects.toMatchObject({
      codigo: 404,
      mensajes: ["No encontrado"],
    } satisfies Partial<ErrorApi>);
  });

  it("no envía el cuerpo cuando no hay payload", async () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001/api/v1";
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ estado: "ok" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(solicitarJson<{ estado: string }>("/health")).resolves.toEqual(
      {
        estado: "ok",
      },
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/api/v1/health",
      expect.objectContaining({
        method: "GET",
        body: undefined,
      }),
    );
  });
});
