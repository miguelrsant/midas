import { describe, expect, it } from "vitest";

import {
  addDays,
  addMonths,
  clampDay,
  dayDiff,
  daysInMonth,
  formatDayHeading,
  formatEntryDate,
  fromDbDate,
  isDateOnly,
  isMonthKey,
  lastDay,
  monthAbbr,
  monthDiff,
  monthTitle,
  toDbDate,
  todayInSaoPaulo,
  weekday,
} from "./dates";

describe("todayInSaoPaulo", () => {
  it("usa o fuso de Brasília na virada do dia", () => {
    expect(todayInSaoPaulo(new Date("2026-10-01T02:59:00Z"))).toBe("2026-09-30");
    expect(todayInSaoPaulo(new Date("2026-10-01T03:00:00Z"))).toBe("2026-10-01");
  });
});

describe("datas sem hora", () => {
  it("valida datas reais, inclusive 29 de fevereiro", () => {
    expect(isDateOnly("2028-02-29")).toBe(true);
    expect(isDateOnly("2026-02-29")).toBe(false);
    expect(isDateOnly("2026-04-31")).toBe(false);
    expect(isDateOnly("2026-9-30")).toBe(false);
    expect(isMonthKey("2026-13")).toBe(false);
  });

  it("dias por mês", () => {
    expect([1, 2, 4, 12].map((m) => daysInMonth(2026, m))).toEqual([31, 28, 30, 31]);
    expect(daysInMonth(2028, 2)).toBe(29);
    expect(daysInMonth(2100, 2)).toBe(28);
    expect(daysInMonth(2000, 2)).toBe(29);
  });

  it("ajusta o dia ao tamanho do mês", () => {
    expect(clampDay("2026-02", 31)).toBe("2026-02-28");
    expect(clampDay("2028-02", 30)).toBe("2028-02-29");
    expect(clampDay("2026-04", 31)).toBe("2026-04-30");
    expect(clampDay("2026-05", 31)).toBe("2026-05-31");
  });

  it("soma meses e dias atravessando o ano", () => {
    expect(addMonths("2026-12", 1)).toBe("2027-01");
    expect(addMonths("2026-01", -1)).toBe("2025-12");
    expect(addMonths("2026-09", 12)).toBe("2027-09");
    expect(monthDiff("2026-09", "2027-01")).toBe(4);
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(dayDiff("2026-09-01", "2026-09-30")).toBe(29);
    expect(lastDay("2026-09")).toBe("2026-09-30");
  });

  it("dia da semana (0 = domingo)", () => {
    expect(weekday("2026-09-30")).toBe(3);
    expect(weekday("2026-09-27")).toBe(0);
  });

  it("ida e volta no banco sempre à meia-noite UTC", () => {
    const db = toDbDate("2026-09-30");
    expect(db.toISOString()).toBe("2026-09-30T00:00:00.000Z");
    expect(fromDbDate(db)).toBe("2026-09-30");
    expect(() => toDbDate("2026-02-30")).toThrow();
  });
});

describe("formatos", () => {
  it("títulos de mês", () => {
    expect(monthTitle("2026-09")).toBe("Setembro 2026");
    expect(monthAbbr("2026-09")).toBe("Set");
  });

  it("data da linha do lançamento", () => {
    const today = "2026-09-30";
    expect(formatEntryDate("2026-09-30", today).short).toBe("hoje");
    expect(formatEntryDate("2026-09-29", today).short).toBe("ontem");
    expect(formatEntryDate("2026-09-05", today)).toEqual({ short: "5 set", long: "5 de setembro" });
    expect(formatEntryDate("2025-09-05", today).short).toBe("5 set 2025");
  });

  it("cabeçalho de dia", () => {
    const today = "2026-09-30";
    expect(formatDayHeading("2026-09-30", today)).toBe("Hoje");
    expect(formatDayHeading("2026-09-29", today)).toBe("Ontem");
    expect(formatDayHeading("2026-09-26", today)).toBe("Sábado, 26 de setembro");
    expect(formatDayHeading("2025-12-25", today)).toBe("Quinta, 25 de dezembro de 2025");
  });
});
