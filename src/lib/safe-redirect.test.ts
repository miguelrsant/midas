import { describe, expect, it } from "vitest";

import { safeRedirectPath } from "./safe-redirect";

describe("safeRedirectPath", () => {
  it.each([
    ["/configuracoes", "/configuracoes"],
    ["/lancamentos?mes=2026-09", "/lancamentos?mes=2026-09"],
    ["/resumo/2026-09#topo", "/resumo/2026-09"],
    // Percent-encoded continua codificado no Location: não injeta cabeçalho.
    ["/%0d%0aSet-Cookie:x", "/%0d%0aSet-Cookie:x"],
  ])("aceita o caminho interno %s", (input, expected) => {
    expect(safeRedirectPath(input)).toBe(expected);
  });

  it.each([
    "https://site-malicioso.com",
    "//site-malicioso.com",
    "/\\site-malicioso.com",
    "javascript:alert(1)",
    "configuracoes",
    "/\u0000",
    "",
    null,
    undefined,
    `/${"a".repeat(600)}`,
  ])("recusa %j", (input) => {
    expect(safeRedirectPath(input as string)).toBe("/");
  });
});
