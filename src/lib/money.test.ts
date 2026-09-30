import { describe, expect, it } from "vitest";

import { formatAmount, formatMoney, MAX_CENTS, MINUS, NBSP, parseMoney, readMoney } from "./money";

describe("formatMoney", () => {
  it("usa espaço inseparável depois do R$", () => {
    expect(formatMoney(123456)).toBe(`R$${NBSP}1.234,56`);
  });

  it("mostra o menos verdadeiro (U+2212) em negativos", () => {
    expect(formatMoney(-850)).toBe(`${MINUS}${NBSP}R$${NBSP}8,50`);
    expect(formatMoney(-850)).not.toContain("-");
  });

  it("mostra + só com sign always", () => {
    expect(formatMoney(540000, { sign: "always" })).toBe(`+${NBSP}R$${NBSP}5.400,00`);
    expect(formatMoney(540000)).toBe(`R$${NBSP}5.400,00`);
  });

  it("não mostra sinal com sign never, nem no zero", () => {
    expect(formatMoney(-850, { sign: "never" })).toBe(`R$${NBSP}8,50`);
    expect(formatMoney(0, { sign: "always" })).toBe(`R$${NBSP}0,00`);
  });

  it("formata centavos isolados e o valor máximo", () => {
    expect(formatMoney(1)).toBe(`R$${NBSP}0,01`);
    expect(formatMoney(MAX_CENTS)).toBe(`R$${NBSP}9.999.999,99`);
  });

  it("recusa valor que não é inteiro", () => {
    expect(() => formatMoney(10.5)).toThrow();
    expect(() => formatMoney(Number.NaN)).toThrow();
  });
});

describe("readMoney", () => {
  it.each([
    ["127,90", 12790],
    ["1.234,56", 123456],
    ["R$ 1.234,56", 123456],
    [`R$${NBSP}8,5`, 850],
    ["8", 800],
    ["0,01", 1],
    [",5", 50],
    ["12.50", 1250],
    ["12.5", 1250],
    ["8.505", 850500],
    ["1.2.3", 12300],
    ["007,00", 700],
    ["9.999.999,99", MAX_CENTS],
  ])("lê %j como %i centavos", (text, cents) => {
    expect(readMoney(text)).toEqual({ ok: true, cents });
  });

  it.each([
    ["", "empty"],
    ["   ", "empty"],
    ["0", "zero"],
    ["0,00", "zero"],
    ["-5", "sign"],
    [`${MINUS}5`, "sign"],
    ["+5", "sign"],
    ["abc", "format"],
    ["1,2,3", "format"],
    ["1,2.3", "format"],
    [".", "format"],
    ["1,234", "decimals"],
    ["10.000.000,00", "tooHigh"],
    ["99999999", "tooHigh"],
  ])("recusa %j com o erro %s", (text, error) => {
    expect(readMoney(text)).toEqual({ ok: false, error });
  });

  it("faz a ida e volta com formatAmount", () => {
    for (const cents of [1, 99, 100, 12790, 123456, MAX_CENTS]) {
      expect(parseMoney(formatAmount(cents))).toBe(cents);
    }
  });

  it("devolve null em parseMoney quando não dá para ler", () => {
    expect(parseMoney("abc")).toBeNull();
  });
});
