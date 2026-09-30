import { describe, expect, it } from "vitest";

import { niceTicks } from "./chart";

/** Troca o espaço inseparável por espaço comum, para ler os textos esperados. */
const plain = (text: string) => text.replace(/\u00a0/g, " ");
import { limitStatus, pickLimitNotice } from "./limits";
import {
  assessMonth,
  balanceSentence,
  chartTitle,
  projectionNote,
  summarySentence,
} from "./phrases";
import {
  buildProjection,
  type EntryFact,
  monthPoints,
  referenceMonths,
  totalsByMonth,
} from "./projection";
import {
  dayAlreadyPassed,
  dueOccurrences,
  endMonthFor,
  firstMonthFor,
  repeatOf,
} from "./recurring";

const e = (
  date: string,
  kind: "income" | "expense",
  amountCents: number,
  extra: Partial<EntryFact> = {},
): EntryFact => ({
  date,
  kind,
  amountCents,
  categoryId: kind === "income" ? "salario" : "mercado",
  fromRecurring: false,
  ...extra,
});

describe("fixos", () => {
  const rule = { dayOfMonth: 31, startMonth: "2026-01", endMonth: null };

  it("dia 31 cai no último dia dos meses curtos", () => {
    const { due, next } = dueOccurrences(rule, "2026-01-31", "2026-04-15");
    expect(due.map((d) => d.date)).toEqual(["2026-01-31", "2026-02-28", "2026-03-31"]);
    expect(next).toBe("2026-04-30");
  });

  it("ano bissexto", () => {
    const { due } = dueOccurrences({ ...rule, startMonth: "2028-02" }, "2028-02-29", "2028-02-29");
    expect(due).toEqual([{ month: "2028-02", date: "2028-02-29" }]);
  });

  it("parcelas acabam no último mês", () => {
    const r = {
      dayOfMonth: 10,
      startMonth: "2026-09",
      endMonth: endMonthFor("2026-09", { mode: "installments", count: 3 }),
    };
    expect(r.endMonth).toBe("2026-11");
    const { due, next } = dueOccurrences(r, "2026-09-10", "2027-06-01");
    expect(due).toHaveLength(3);
    expect(next).toBeNull();
    expect(repeatOf(r)).toEqual({ mode: "installments", count: 3 });
  });

  it("só uma vez", () => {
    expect(endMonthFor("2026-12", { mode: "once" })).toBe("2026-12");
    expect(repeatOf({ dayOfMonth: 1, startMonth: "2026-12", endMonth: "2026-12" })).toEqual({
      mode: "once",
    });
  });

  it("nada vence antes do dia", () => {
    const { due, next } = dueOccurrences(rule, "2026-09-30", "2026-09-29");
    expect(due).toEqual([]);
    expect(next).toBe("2026-09-30");
  });

  it("limita a recuperação de meses parados", () => {
    const { due } = dueOccurrences(
      { ...rule, startMonth: "2020-01" },
      "2020-01-31",
      "2026-09-30",
      24,
    );
    expect(due).toHaveLength(24);
  });

  it("fixo novo não preenche o passado", () => {
    expect(firstMonthFor(10, "2026-09-30", false)).toBe("2026-10");
    expect(firstMonthFor(10, "2026-09-30", true)).toBe("2026-09");
    expect(firstMonthFor(30, "2026-09-30", false)).toBe("2026-09");
    expect(dayAlreadyPassed(10, "2026-09-30")).toBe(true);
    expect(dayAlreadyPassed(31, "2026-09-30")).toBe(false);
  });
});

describe("projeção", () => {
  const today = "2026-09-20";

  it("meses de referência: só fechados, com lançamento, pulando o primeiro mês começado no meio", () => {
    const entries = [
      e("2026-05-20", "expense", 100),
      e("2026-06-10", "expense", 100),
      e("2026-08-01", "expense", 100),
    ];
    const totals = totalsByMonth(entries);
    expect(referenceMonths(totals, today, "2026-05-20")).toEqual(["2026-06", "2026-08"]);
    expect(referenceMonths(totals, today, "2026-05-05")).toEqual(["2026-05", "2026-06", "2026-08"]);
    expect(referenceMonths(totals, today, null)).toEqual([]);
  });

  it("sem mês fechado não há projeção", () => {
    const p = buildProjection({
      today,
      entries: [e("2026-09-01", "expense", 100)],
      firstEntryDate: "2026-09-01",
      recurrings: [],
      expected: [],
    });
    expect(p.future("2026-10")).toBeNull();
  });

  it("gasto: média dos variáveis + fixos, sem contar o fixo duas vezes", () => {
    const entries = [
      e("2026-06-05", "expense", 100_000),
      e("2026-07-05", "expense", 200_000),
      e("2026-08-05", "expense", 300_000),
      e("2026-08-10", "expense", 150_000, { fromRecurring: true, categoryId: "moradia" }),
      e("2026-06-01", "income", 500_000),
      e("2026-07-01", "income", 500_000),
      e("2026-08-01", "income", 500_000),
      e("2026-08-15", "income", 900_000, { categoryId: "rescisao" }),
    ];
    const p = buildProjection({
      today,
      entries,
      firstEntryDate: "2026-06-01",
      recurrings: [
        {
          kind: "expense",
          amountCents: 150_000,
          dayOfMonth: 10,
          startMonth: "2026-08",
          endMonth: null,
        },
      ],
      expected: [{ amountCents: 270_000, dueDate: "2026-11-30", categoryId: "decimo-terceiro" }],
    });
    const nov = p.future("2026-11")!;
    expect(nov.expenseCents).toBe(200_000 + 150_000);
    // Renda: média sem a rescisão + 13º previsto.
    expect(nov.incomeCents).toBe(500_000 + 270_000);
    expect(nov.hasThirteenth).toBe(true);
  });

  it("renda fixa substitui a média", () => {
    const entries = [e("2026-08-01", "income", 999_000), e("2026-08-02", "expense", 1)];
    const p = buildProjection({
      today,
      entries,
      firstEntryDate: "2026-08-01",
      recurrings: [
        {
          kind: "income",
          amountCents: 540_000,
          dayOfMonth: 5,
          startMonth: "2026-10",
          endMonth: null,
        },
      ],
      expected: [],
    });
    expect(p.future("2026-10")!.incomeCents).toBe(540_000);
  });

  it("mês atual: real + fixos que faltam + o que falta da média", () => {
    const entries = [
      e("2026-08-02", "expense", 300_000),
      e("2026-09-02", "expense", 100_000),
      e("2026-09-01", "income", 500_000),
    ];
    const p = buildProjection({
      today,
      entries,
      firstEntryDate: "2026-08-02",
      recurrings: [
        {
          kind: "expense",
          amountCents: 50_000,
          dayOfMonth: 25,
          startMonth: "2026-09",
          endMonth: null,
        },
      ],
      expected: [],
    });
    expect(p.currentEstimate).toEqual({
      incomeCents: 500_000,
      expenseCents: 100_000 + 50_000 + 200_000,
    });
  });

  it("pontos: passados reais, atual marcado, futuros projetados", () => {
    const entries = [e("2026-08-02", "expense", 300_000)];
    const p = buildProjection({
      today,
      entries,
      firstEntryDate: "2026-08-02",
      recurrings: [],
      expected: [],
    });
    const pts = monthPoints(p, ["2026-08", "2026-09", "2026-10"], today);
    expect(pts.map((x) => [x.projected, x.current ?? false])).toEqual([
      [false, false],
      [false, true],
      [true, false],
    ]);
  });
});

describe("limites", () => {
  it.each([
    [35_900, 40_000, "ok"],
    [36_000, 40_000, "near"],
    [40_000, 40_000, "reached"],
    [42_500, 40_000, "over"],
  ] as const)("%i de %i → %s", (spent, limit, state) => {
    expect(limitStatus(spent, limit).state).toBe(state);
  });

  it("aviso da mais perto do limite, com as outras contadas", () => {
    const pick = pickLimitNotice([
      { categoryId: "a", name: "A", spentCents: 91, limitCents: 100 },
      { categoryId: "b", name: "B", spentCents: 120, limitCents: 100 },
      { categoryId: "c", name: "C", spentCents: 10, limitCents: 100 },
    ]);
    expect(pick!.row.categoryId).toBe("b");
    expect(pick!.others).toBe(1);
  });
});

describe("gráfico e frases", () => {
  it("marcas redondas a partir de zero", () => {
    expect(niceTicks(620_000)).toEqual([0, 200_000, 400_000, 600_000, 800_000]);
    expect(niceTicks(0)[0]).toBe(0);
  });

  it("título: falta projetada vem primeiro, sem acento", () => {
    const title = plain(
      chartTitle([
        { month: "2026-10", incomeCents: 500_000, expenseCents: 530_000, projected: true },
        { month: "2026-12", incomeCents: 900_000, expenseCents: 270_000, projected: true },
      ]),
    );
    expect(title).toBe("Outubro pode fechar com R$ 300 a menos.");
  });

  it("título: sobra do último mês projetado, à centena", () => {
    expect(
      plain(
        chartTitle([
          { month: "2026-12", incomeCents: 900_000, expenseCents: 270_000, projected: true },
        ]),
      ),
    ).toBe("Dezembro deve fechar com R$ 6.300 de sobra.");
  });

  it("frases do saldo", () => {
    expect(balanceSentence(620_000, 435_790, "2026-09", true)).toBe(
      "Você usou 70% do que entrou este mês.",
    );
    expect(balanceSentence(0, 100, "2026-09", true)).toBe(
      "Anote sua renda para ver quanto já foi gasto.",
    );
    expect(balanceSentence(100, 200, "2026-08", false)).toBe(
      "Você gastou mais do que entrou em agosto.",
    );
  });

  it("avaliação do mês e resumo", () => {
    expect(assessMonth("2026-09", { incomeCents: 10, expenseCents: 5 }, true).accent).toBe("bem");
    expect(
      plain(assessMonth("2026-09", { incomeCents: 10_000, expenseCents: 22_000 }, true).text),
    ).toBe("Setembro está apertado: faltam R$ 120 para fechar no azul.");
    expect(plain(summarySentence(184_210, 153_210, "2026-09", true))).toBe(
      "Sobraram R$ 1.842 até agora, R$ 310 a mais que em agosto.",
    );
    expect(
      projectionNote(["2026-08", "2026-09"], {
        hasFixed: true,
        hasExpected: false,
        fixedIncomeOnly: false,
      }),
    ).toBe("Estimativa com base em agosto e setembro, nos fixos.");
  });
});
