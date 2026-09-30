import { describe, expect, it } from "vitest";

import { buildCsp } from "./proxy";

describe("buildCsp", () => {
  const csp = buildCsp("abc123", { isDev: false, isHttps: true });

  it("só permite o próprio domínio e scripts com nonce", () => {
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self' 'nonce-abc123' 'strict-dynamic'");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).not.toMatch(/https?:\/\//);
  });

  it("bloqueia iframes, plugins e base tag", () => {
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'none'");
    expect(csp).toContain("upgrade-insecure-requests");
  });

  it("libera unsafe-eval só no dev, e não força https no localhost", () => {
    const dev = buildCsp("abc123", { isDev: true, isHttps: false });
    expect(dev).toContain("'unsafe-eval'");
    expect(dev).not.toContain("upgrade-insecure-requests");
  });
});

describe("proxy", () => {
  it("manda para a entrada quem não tem sessão", async () => {
    const { proxy } = await import("./proxy");
    const { NextRequest } = await import("next/server");
    const response = proxy(new NextRequest("http://localhost:3000/lancamentos?mes=2026-09"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/entrar?de=%2Flancamentos%3Fmes%3D2026-09",
    );
  });

  it("não redireciona Server Action sem sessão (ela mesma responde 'sessão vencida')", async () => {
    const { proxy } = await import("./proxy");
    const { NextRequest } = await import("next/server");
    const request = new NextRequest("http://localhost:3000/lancamentos/novo", {
      method: "POST",
      headers: { "next-action": "abc" },
    });
    expect(proxy(request).status).toBe(200);
  });

  it("a página de conta apagada é pública", async () => {
    const { proxy } = await import("./proxy");
    const { NextRequest } = await import("next/server");
    expect(proxy(new NextRequest("http://localhost:3000/conta-apagada")).status).toBe(200);
  });
});
