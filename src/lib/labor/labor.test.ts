import { describe, expect, it } from "vitest";

import {
  calculateNetSalary,
  netSalaryFromGross,
  calculateTermination,
  calculateThirteenth,
  calculateUnemployment,
  calculateVacation,
  noticeDays,
  unemploymentInstallments,
  unemploymentValue,
} from "./calculators";
import { LaborInputError } from "./errors";
import { inssFor } from "./inss";
import { irrfFor } from "./irrf";
import { fullYears, thirteenthMonths, vacationMonths } from "./periods";
import { terminationInput } from "./schemas";

/*
 * Casos de referência:
 * - INSS 2026: Portaria Interministerial MPS/MF nº 13/2026 (R$ 5.000 → R$ 501,51).
 * - IRRF 2026: exemplos da Receita Federal para a Lei 15.270/2025
 *   (R$ 4.000 e R$ 5.000 → zero; R$ 6.000 com INSS de R$ 649,60 → R$ 382,88).
 */

describe("inssFor", () => {
  it.each([
    [500_000, 50_151],
    [600_000, 64_151],
    [162_100, 12_158], // só a 1ª faixa: 1.621 × 7,5% = 121,575 → 121,58
    [847_555, 98_809], // teto de 2026
    [2_000_000, 98_809], // acima do teto, o desconto para no teto
  ])("2026: %i centavos → %i", (gross, expected) => {
    expect(inssFor(gross, "2026-09-30").cents).toBe(expected);
  });

  it("usa a tabela de 2025 para datas de 2025", () => {
    // 1.518 × 7,5% = 113,85
    expect(inssFor(151_800, "2025-06-01").cents).toBe(11_385);
    expect(inssFor(151_800, "2025-06-01").table.id).toBe("inss-2025");
  });

  it("recusa datas antes de 2025", () => {
    expect(() => inssFor(100_000, "2024-12-31")).toThrow(LaborInputError);
  });

  it("depois da última tabela usa a mais recente e avisa", () => {
    const r = inssFor(500_000, "2027-03-01");
    expect(r.table.id).toBe("inss-2026");
    expect(r.outdated).toBe(true);
  });
});

describe("irrfFor", () => {
  const paidOn = "2026-09-30";

  it("zera o imposto até R$ 5.000 com a redução de 2026", () => {
    const r = irrfFor({ grossCents: 500_000, inssCents: 50_151, dependents: 0, paidOn });
    expect(r.taxCents).toBe(31_289);
    expect(r.usedSimplified).toBe(true);
    expect(r.cents).toBe(0);
  });

  it("zera o imposto de R$ 4.000", () => {
    const inss = inssFor(400_000, paidOn).cents;
    expect(irrfFor({ grossCents: 400_000, inssCents: inss, dependents: 0, paidOn }).cents).toBe(0);
  });

  it("aplica a redução parcial entre R$ 5.000 e R$ 7.350 (exemplo da Receita)", () => {
    const r = irrfFor({ grossCents: 600_000, inssCents: 64_960, dependents: 0, paidOn });
    expect(r.taxCents).toBe(56_263);
    expect(r.reductionCents).toBe(17_975);
    expect(r.cents).toBe(38_288);
  });

  it("não reduz acima de R$ 7.350", () => {
    const r = irrfFor({ grossCents: 760_720, inssCents: 90_000, dependents: 0, paidOn });
    expect(r.reductionCents).toBe(0);
    expect(r.cents).toBe(r.taxCents);
  });

  it("antes de 2026 não há redução", () => {
    const r = irrfFor({
      grossCents: 500_000,
      inssCents: 48_000,
      dependents: 0,
      paidOn: "2025-09-30",
    });
    expect(r.reductionCents).toBe(0);
    expect(r.cents).toBeGreaterThan(0);
  });

  it("dependentes entram nas deduções legais quando passam do simplificado", () => {
    const sem = irrfFor({ grossCents: 900_000, inssCents: 90_000, dependents: 0, paidOn });
    const com = irrfFor({ grossCents: 900_000, inssCents: 90_000, dependents: 2, paidOn });
    expect(com.cents).toBeLessThan(sem.cents);
  });

  it("dispensa retenção de até R$ 10, exceto no 13º", () => {
    // Base um pouco acima da isenção de 2025: imposto pequeno.
    const input = { grossCents: 310_000, inssCents: 0, dependents: 0, paidOn: "2025-09-30" };
    const monthly = irrfFor(input);
    const exclusive = irrfFor({ ...input, exclusive: true });
    expect(exclusive.taxCents).toBeLessThanOrEqual(1_000);
    expect(monthly.cents).toBe(0);
    expect(exclusive.cents).toBe(exclusive.taxCents);
  });
});

describe("periods", () => {
  it("conta o mês do 13º com 15 dias ou mais", () => {
    expect(thirteenthMonths(2026, "2026-01-01", "2026-12-31")).toBe(12);
    // Admissão em 17/09: 14 dias em setembro (não conta).
    expect(thirteenthMonths(2026, "2026-09-17", "2026-12-31")).toBe(3);
    // Admissão em 16/09: 15 dias (conta).
    expect(thirteenthMonths(2026, "2026-09-16", "2026-12-31")).toBe(4);
  });

  it("fevereiro: admissão em 15/02 conta só em ano bissexto", () => {
    expect(thirteenthMonths(2027, "2027-02-15", "2027-02-28")).toBe(0);
    expect(thirteenthMonths(2028, "2028-02-15", "2028-02-29")).toBe(1);
  });

  it("anos completos de serviço", () => {
    expect(fullYears("2025-03-10", "2026-03-08")).toBe(0);
    expect(fullYears("2025-03-10", "2026-03-09")).toBe(1);
    expect(fullYears("2024-02-29", "2025-02-28")).toBe(1);
  });

  it("avos de férias pelo aniversário da admissão", () => {
    // 10/03 a 30/09: 6 meses + 21 dias → 7.
    expect(vacationMonths("2023-03-10", "2026-09-30")).toBe(7);
    // 10/03 a 23/09: 6 meses + 14 dias → 6.
    expect(vacationMonths("2023-03-10", "2026-09-23")).toBe(6);
  });
});

describe("noticeDays", () => {
  it.each([
    ["2026-01-05", "2026-09-30", 30],
    ["2025-09-30", "2026-09-30", 33],
    ["2006-09-30", "2026-09-30", 90],
    ["2000-01-01", "2026-09-30", 90],
  ])("admissão %s, saída %s → %i dias", (admission, exit, days) => {
    expect(noticeDays(admission, exit)).toBe(days);
  });
});

describe("calculateVacation", () => {
  it("30 dias com salário de R$ 3.200", () => {
    const r = calculateVacation({
      grossCents: 320_000,
      extrasCents: 0,
      days: 30,
      sellTen: false,
      startDate: "2026-12-15",
      dependents: 0,
    });
    const lines = r.sections[0]!.lines;
    expect(lines[0]).toMatchObject({ cents: 320_000 });
    expect(lines[1]).toMatchObject({ cents: 106_667 });
    // 4.266,67 de férias + 1/3: INSS 2026 = 395,44; IR zerado pela redução.
    expect(r.headlineCents).toBe(426_667 - inssFor(426_667, "2026-12-15").cents);
    expect(r.payments[0]).toMatchObject({ labelKey: "ferias", dueDate: "2026-12-13" });
  });

  it("a venda de 10 dias não tem desconto", () => {
    const r = calculateVacation({
      grossCents: 300_000,
      extrasCents: 0,
      days: 20,
      sellTen: true,
      startDate: "2026-10-05",
      dependents: 0,
    });
    const labels = r.sections[0]!.lines.map((l) => l.label);
    expect(labels).toContain("Venda de 10 dias");
    // 20 dias = 2.000; 1/3 = 666,67; venda 1.000 + 333,33
    const inss = inssFor(266_667, "2026-10-05").cents;
    expect(r.headlineCents).toBe(200_000 + 66_667 + 100_000 + 33_333 - inss);
  });
});

describe("calculateThirteenth", () => {
  it("ano inteiro: duas parcelas, a 1ª sem descontos", () => {
    const r = calculateThirteenth({
      grossCents: 540_000,
      extrasCents: 0,
      admissionDate: "2020-01-01",
      year: 2026,
      dependents: 0,
    });
    const [first, second] = r.payments;
    expect(first).toMatchObject({ cents: 270_000, dueDate: "2026-11-30" });
    const inss = inssFor(540_000, "2026-12-01").cents;
    const ir = irrfFor({
      grossCents: 540_000,
      inssCents: inss,
      dependents: 0,
      paidOn: "2026-12-20",
      exclusive: true,
    }).cents;
    expect(second).toMatchObject({ cents: 540_000 - 270_000 - inss - ir, dueDate: "2026-12-20" });
  });

  it("proporcional a quem entrou no meio do ano", () => {
    const r = calculateThirteenth({
      grossCents: 360_000,
      extrasCents: 0,
      admissionDate: "2026-07-01",
      year: 2026,
      dependents: 0,
    });
    // 6 meses: 1.800,00; 1ª parcela 900,00
    expect(r.payments[0]!.cents).toBe(90_000);
  });

  it("sem 15 dias no ano, não calcula", () => {
    expect(() =>
      calculateThirteenth({
        grossCents: 300_000,
        extrasCents: 0,
        admissionDate: "2026-12-20",
        year: 2026,
        dependents: 0,
      }),
    ).toThrow(LaborInputError);
  });
});

const baseTermination = {
  grossCents: 300_000,
  extrasCents: 0,
  admissionDate: "2024-03-10",
  lastDay: "2026-09-30",
  notice: "paid" as const,
  overdueVacations: 0 as const,
  fgtsBalanceCents: 700_000,
  anniversaryWithdrawal: false,
  dependents: 0,
};

describe("calculateTermination", () => {
  it("sem justa causa com aviso pago: projeta o fim e paga multa de 40%", () => {
    const r = calculateTermination({ ...baseTermination, type: "without_cause" });
    const employer = r.sections[0]!.lines;
    // 2 anos completos → 36 dias de aviso = 3.600,00
    expect(employer.find((l) => l.label.startsWith("Aviso prévio"))!.cents).toBe(360_000);
    // Saída em 30/09 (último dia do mês): saldo = salário cheio.
    expect(employer[0]).toMatchObject({ label: "Saldo de salário (30 dias)", cents: 300_000 });
    // Projeção até 05/11: 13º com 10/12 (novembro tem só 5 dias e não conta).
    expect(employer.find((l) => l.label.startsWith("13º"))!.label).toBe("13º proporcional (10/12)");
    const fgts = r.sections[1]!.lines;
    const deposit = fgts.find((l) => l.label.startsWith("Depósito"))!.cents;
    const fine = fgts.find((l) => l.label.startsWith("Multa de 40%"))!.cents;
    expect(fine).toBe(Math.round(((700_000 + deposit) * 40) / 100));
    expect(r.payments.map((p) => p.labelKey)).toEqual(["rescisao", "rescisao-fgts"]);
    expect(r.payments[0]!.dueDate).toBe("2026-10-10");
  });

  it("justa causa: sem 13º, sem férias proporcionais, sem FGTS", () => {
    const r = calculateTermination({ ...baseTermination, type: "with_cause", notice: "none" });
    const labels = r.sections[0]!.lines.map((l) => l.label);
    expect(labels.some((l) => l.startsWith("13º"))).toBe(false);
    expect(labels.some((l) => l.startsWith("Férias proporcionais"))).toBe(false);
    expect(r.payments.find((p) => p.labelKey === "rescisao-fgts")).toBeUndefined();
  });

  it("acordo: metade do aviso, multa de 20% e 80% do saldo", () => {
    const r = calculateTermination({ ...baseTermination, type: "agreement" });
    const aviso = r.sections[0]!.lines.find((l) => l.label.startsWith("Aviso prévio"))!;
    expect(aviso.label).toBe("Aviso prévio pago (18 dias)");
    expect(r.sections[1]!.lines.some((l) => l.label === "Multa de 20%")).toBe(true);
  });

  it("pedido de demissão sem cumprir o aviso desconta 30 dias e não saca FGTS", () => {
    const r = calculateTermination({
      ...baseTermination,
      type: "resignation",
      notice: "not_served",
    });
    expect(r.sections[0]!.lines.some((l) => l.label === "Desconto do aviso não cumprido")).toBe(
      true,
    );
    expect(r.payments.find((p) => p.labelKey === "rescisao-fgts")).toBeUndefined();
  });

  it("saque-aniversário: só a multa sai", () => {
    const r = calculateTermination({
      ...baseTermination,
      type: "without_cause",
      anniversaryWithdrawal: true,
    });
    const fgts = r.sections[1]!.lines;
    const fine = fgts.find((l) => l.label.startsWith("Multa"))!.cents;
    expect(r.payments.find((p) => p.labelKey === "rescisao-fgts")!.cents).toBe(fine);
  });

  it("dois períodos vencidos: o mais antigo em dobro", () => {
    const r = calculateTermination({
      ...baseTermination,
      type: "without_cause",
      overdueVacations: 2,
    });
    const line = r.sections[0]!.lines.find((l) => l.label.startsWith("Férias vencidas"))!;
    expect(line.cents).toBe(3 * (300_000 + 100_000));
  });

  it("saldo de salário proporcional no meio do mês e em fevereiro", () => {
    const mid = calculateTermination({
      ...baseTermination,
      type: "resignation",
      notice: "worked",
      lastDay: "2026-09-15",
    });
    expect(mid.sections[0]!.lines[0]).toMatchObject({
      label: "Saldo de salário (15 dias)",
      cents: 150_000,
    });
    const feb = calculateTermination({
      ...baseTermination,
      type: "resignation",
      notice: "worked",
      lastDay: "2028-02-29",
    });
    expect(feb.sections[0]!.lines[0]).toMatchObject({ cents: 300_000 });
  });

  it("valida a data de saída depois da entrada", () => {
    const parsed = terminationInput.safeParse({
      ...baseTermination,
      type: "without_cause",
      lastDay: "2020-01-01",
    });
    expect(parsed.success).toBe(false);
  });
});

describe("calculateNetSalary", () => {
  it("R$ 5.000 em 2026: só o INSS", () => {
    const r = calculateNetSalary({
      grossCents: 500_000,
      dependents: 0,
      otherDiscountsCents: 0,
      referenceDate: "2026-09-30",
      payDay: 5,
    });
    expect(r.headlineCents).toBe(449_849);
  });

  it("líquido a partir do bruto, sem dependentes nem descontos", () => {
    expect(netSalaryFromGross(500_000, "2026-09-30").netCents).toBe(449_849);
  });
});

describe("seguro-desemprego", () => {
  it.each([
    [0, 11, 0],
    [0, 12, 4],
    [0, 24, 5],
    [1, 9, 3],
    [1, 12, 4],
    [2, 6, 3],
    [2, 5, 0],
  ] as const)("pedido %i com %i meses → %i parcelas", (previous, months, expected) => {
    expect(unemploymentInstallments(previous, months)).toBe(expected);
  });

  it.each([
    [150_000, 162_100], // piso: salário mínimo
    [222_217, 177_774],
    [300_000, 177_774 + 38_892],
    [500_000, 251_865], // teto
  ])("média %i → parcela %i (2026)", (average, expected) => {
    expect(unemploymentValue(average, "2026-09-30").cents).toBe(expected);
  });

  it("só dispensa sem justa causa tem direito", () => {
    expect(() =>
      calculateUnemployment({
        type: "resignation",
        lastDay: "2026-09-30",
        salariesCents: [300_000, 300_000, 300_000],
        monthsWorked36: 30,
        previousRequests: 0,
        lastBenefitOver16Months: true,
      }),
    ).toThrow(LaborInputError);
  });

  it("gera uma renda prevista por parcela, a cada 30 dias", () => {
    const r = calculateUnemployment({
      type: "without_cause",
      lastDay: "2026-09-30",
      salariesCents: [300_000, 300_000, 300_000],
      monthsWorked36: 30,
      previousRequests: 0,
      lastBenefitOver16Months: true,
    });
    expect(r.payments).toHaveLength(5);
    expect(r.payments[0]!.dueDate).toBe("2026-11-06");
    expect(r.payments[1]!.dueDate).toBe("2026-12-06");
  });
});
