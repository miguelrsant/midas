import { describe, expect, it } from "vitest";

import { initials, longDate, salutation } from "./greeting";

// Horários em UTC; Brasília é UTC−3.
const at = (iso: string) => new Date(iso);

describe("salutation", () => {
  it.each([
    ["2026-09-30T07:59:00Z", "Boa noite"], // 4h59
    ["2026-09-30T08:00:00Z", "Bom dia"], // 5h00
    ["2026-09-30T14:59:00Z", "Bom dia"], // 11h59
    ["2026-09-30T15:00:00Z", "Boa tarde"], // 12h00
    ["2026-09-30T20:59:00Z", "Boa tarde"], // 17h59
    ["2026-09-30T21:00:00Z", "Boa noite"], // 18h00
    ["2026-10-01T02:00:00Z", "Boa noite"], // 23h00
  ])("%s → %s", (iso, expected) => {
    expect(salutation(at(iso))).toBe(expected);
  });
});

describe("longDate", () => {
  it("escreve o dia da semana sem -feira, com maiúscula", () => {
    expect(longDate(at("2026-09-30T15:00:00Z"))).toBe("Quarta, 30 de setembro");
    expect(longDate(at("2026-10-03T15:00:00Z"))).toBe("Sábado, 3 de outubro");
  });

  it("usa o fuso de Brasília na virada do dia", () => {
    expect(longDate(at("2026-10-01T02:00:00Z"))).toBe("Quarta, 30 de setembro");
  });
});

describe("initials", () => {
  it.each([
    ["Miguel", "M"],
    ["Ana Luiza", "AL"],
    ["maria aparecida da silva", "MA"],
    ["Érica", "É"],
    ["  🌻 Bia ", "B"],
    ["🌻", null],
    ["", null],
    [null, null],
  ])("%j → %j", (nickname, expected) => {
    expect(initials(nickname)).toBe(expected);
  });
});
