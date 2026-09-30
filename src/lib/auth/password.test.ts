import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "./password";

describe("hashPassword", () => {
  it("usa Argon2id com os parâmetros da OWASP", async () => {
    const hash = await hashPassword("cafe com pao na varanda");
    expect(hash).toMatch(/^\$argon2id\$v=19\$m=19456,t=2,p=1\$/);
  });

  it("gera hashes diferentes para a mesma senha (sal aleatório)", async () => {
    const a = await hashPassword("cafe com pao na varanda");
    const b = await hashPassword("cafe com pao na varanda");
    expect(a).not.toBe(b);
  });

  it("confere a senha certa e recusa a errada", async () => {
    const hash = await hashPassword("cafe com pao na varanda");
    expect(await verifyPassword({ hash, password: "cafe com pao na varanda" })).toBe(true);
    expect(await verifyPassword({ hash, password: "cafe com pao na varanda " })).toBe(false);
  });

  it("aceita o mesmo acento digitado de jeitos diferentes (NFKC)", async () => {
    const composed = "café com pão na varanda";
    const decomposed = "café com pão na varanda";
    const hash = await hashPassword(composed);
    expect(await verifyPassword({ hash, password: decomposed })).toBe(true);
  });

  it("trata hash corrompido como senha errada", async () => {
    expect(await verifyPassword({ hash: "nao-e-um-hash", password: "qualquer coisa" })).toBe(false);
  });
});
