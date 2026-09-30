import { createHash } from "node:crypto";

import { describe, expect, it, vi } from "vitest";

import { checkPasswordLocally, isPasswordBreached } from "./password-policy";
import { passwordLength, shortPasswordMessage } from "./password-rules";

describe("checkPasswordLocally", () => {
  it("aceita frases longas, com espaço e acento", () => {
    expect(checkPasswordLocally("café com pão na varanda")).toBeNull();
  });

  it("exige 15 caracteres, contando emoji como um", () => {
    expect(checkPasswordLocally("14 caracteres!")).toBe("too-short");
    expect(checkPasswordLocally("🌧🌧🌧🌧🌧🌧🌧🌧🌧🌧🌧🌧🌧🌧")).toBe("too-short");
    expect(passwordLength("🌧".repeat(15))).toBe(15);
  });

  it("limita a 128 caracteres", () => {
    expect(checkPasswordLocally("a b".repeat(43))).toBe("too-long");
  });

  it.each([
    "passwordpassword",
    "Senha Senha Senha",
    "123456789012345",
    "aaaaaaaaaaaaaaaaaa",
    "abcabcabcabcabcabc",
    "midasmidas123456",
    "MIDAS 2026 !!!!!!!",
  ])("recusa %j como comum ou previsível", (password) => {
    expect(checkPasswordLocally(password)).toBe("common");
  });

  it("não recusa frase que só contém a palavra midas no meio", () => {
    expect(checkPasswordLocally("o rei midas tinha orelhas de burro")).toBeNull();
  });

  it("diz quantos caracteres faltam", () => {
    expect(shortPasswordMessage("curta demais")).toBe(
      "A senha precisa ter pelo menos 15 caracteres. Faltam 3.",
    );
  });
});

describe("isPasswordBreached", () => {
  const password = "correct horse battery staple";
  const sha1 = createHash("sha1").update(password).digest("hex").toUpperCase();

  it("envia só o prefixo de 5 caracteres, com preenchimento", async () => {
    const fetchMock = vi.fn(async () => new Response("00000:1\r\n"));
    await isPasswordBreached(password, fetchMock as unknown as typeof fetch);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(`https://api.pwnedpasswords.com/range/${sha1.slice(0, 5)}`);
    expect(url).not.toContain(sha1.slice(5));
    expect((init.headers as Record<string, string>)["Add-Padding"]).toBe("true");
  });

  it("encontra a senha pelo sufixo", async () => {
    const body = `ABCDEF0123456789ABCDEF0123456789ABC:0\r\n${sha1.slice(5)}:42\r\n`;
    const fetchMock = vi.fn(async () => new Response(body));
    expect(await isPasswordBreached(password, fetchMock as unknown as typeof fetch)).toBe(true);
  });

  it("ignora sufixo com contagem zero (linha de preenchimento)", async () => {
    const fetchMock = vi.fn(async () => new Response(`${sha1.slice(5)}:0\r\n`));
    expect(await isPasswordBreached(password, fetchMock as unknown as typeof fetch)).toBe(false);
  });

  it("não bloqueia o cadastro se o serviço cair", async () => {
    const failing = vi.fn(async () => {
      throw new Error("timeout");
    });
    expect(await isPasswordBreached(password, failing as unknown as typeof fetch)).toBe(false);
    const unavailable = vi.fn(async () => new Response("", { status: 503 }));
    expect(await isPasswordBreached(password, unavailable as unknown as typeof fetch)).toBe(false);
  });
});
