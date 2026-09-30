import { afterEach, describe, expect, it } from "vitest";

import {
  needsReseal,
  openText,
  sealText,
  SealedTextError,
  setKeyringForTests,
  tryOpenText,
} from "./fields";

const K1 = "k1:" + Buffer.alloc(32, 1).toString("base64");
const K2 = "k2:" + Buffer.alloc(32, 2).toString("base64");
const ref = { field: "entry.description", userId: "user-a", rowId: "row-1" };

afterEach(() => setKeyringForTests(K1, "k1"));

describe("texto cifrado", () => {
  it("abre o que cifrou, com acentos e emoji", () => {
    setKeyringForTests(K1, "k1");
    const sealed = sealText("Farmácia do bairro ✓", ref);
    expect(sealed.startsWith("v1.k1.")).toBe(true);
    expect(sealed).not.toContain("Farm");
    expect(openText(sealed, ref)).toBe("Farmácia do bairro ✓");
  });

  it("cada cifra é diferente (IV aleatório)", () => {
    setKeyringForTests(K1, "k1");
    expect(sealText("Mercado", ref)).not.toBe(sealText("Mercado", ref));
  });

  it("não abre em outra linha, outra conta ou outra coluna", () => {
    setKeyringForTests(K1, "k1");
    const sealed = sealText("Psicóloga", ref);
    expect(() => openText(sealed, { ...ref, rowId: "row-2" })).toThrow(SealedTextError);
    expect(() => openText(sealed, { ...ref, userId: "user-b" })).toThrow(SealedTextError);
    expect(() => openText(sealed, { ...ref, field: "recurring.description" })).toThrow(
      SealedTextError,
    );
  });

  it("recusa cifra adulterada", () => {
    setKeyringForTests(K1, "k1");
    const sealed = sealText("Aluguel", ref);
    const parts = sealed.split(".");
    const body = Buffer.from(parts[3]!, "base64url");
    body[0] = body[0]! ^ 1;
    parts[3] = body.toString("base64url");
    expect(() => openText(parts.join("."), ref)).toThrow(SealedTextError);
    expect(tryOpenText(parts.join("."), ref)).toBeNull();
    expect(tryOpenText("lixo", ref)).toBeNull();
  });

  it("rotação: abre com a chave antiga e cifra com a nova", () => {
    setKeyringForTests(K1, "k1");
    const old = sealText("Internet", ref);
    setKeyringForTests(`${K2},${K1}`, "k2");
    expect(openText(old, ref)).toBe("Internet");
    expect(needsReseal(old)).toBe(true);
    expect(sealText("Internet", ref).startsWith("v1.k2.")).toBe(true);
  });
});
