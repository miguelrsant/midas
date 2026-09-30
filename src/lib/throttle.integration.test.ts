import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { db } from "@/lib/db";
import { consume, emailKey } from "@/lib/throttle";

beforeEach(async () => {
  await db.throttle.deleteMany();
});

afterAll(async () => {
  await db.$disconnect();
});

describe("consume", () => {
  it("deixa passar até o limite e barra depois", async () => {
    const rule = { windowMs: 60_000, max: 3 };
    const results = [];
    for (let i = 0; i < 5; i++) results.push(await consume("teste:a", rule));
    expect(results).toEqual([true, true, true, false, false]);
  });

  it("recomeça a contagem quando a janela vence", async () => {
    const rule = { windowMs: 60_000, max: 1 };
    expect(await consume("teste:b", rule)).toBe(true);
    expect(await consume("teste:b", rule)).toBe(false);
    await db.throttle.update({
      where: { key: "teste:b" },
      data: { expiresAt: new Date(Date.now() - 1) },
    });
    expect(await consume("teste:b", rule)).toBe(true);
  });

  it("não perde contagem com requisições ao mesmo tempo", async () => {
    const rule = { windowMs: 60_000, max: 10 };
    const results = await Promise.all(Array.from({ length: 25 }, () => consume("teste:c", rule)));
    expect(results.filter(Boolean)).toHaveLength(10);
  });
});

describe("emailKey", () => {
  it("não guarda o e-mail e ignora maiúsculas e espaços", () => {
    const key = emailKey("mail", "Ana@Exemplo.test ");
    expect(key).toBe(emailKey("mail", "ana@exemplo.test"));
    expect(key).not.toContain("ana");
    expect(key.length).toBeLessThanOrEqual(100);
  });
});
