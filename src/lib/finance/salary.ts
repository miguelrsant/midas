import { clampDay, type DateOnly, type MonthKey } from "@/lib/dates";

import { firstMonthFor } from "./recurring";

/**
 * Salário como renda fixa, numa data só ou dividido em adiantamento e resto
 * (docs/design-system/17-padroes-de-tela.md#salário). Código puro, em centavos.
 * A porcentagem do adiantamento vale sobre o líquido: é o dinheiro que cai na conta.
 */

export const SALARY_DAY = 5;
export const ADVANCE_DAY = 20;
export const DEFAULT_ADVANCE_PERCENT = 40;
export const ADVANCE_PERCENTS = [10, 20, 30, 40, 50, 60, 70, 80, 90] as const;

/** Adiantamento = parte inteira da porcentagem; o resto leva os centavos que sobrarem. */
export function splitSalary(netCents: number, percent: number) {
  if (!Number.isInteger(percent) || percent < 1 || percent > 99) {
    throw new RangeError("A porcentagem do adiantamento vai de 1 a 99.");
  }
  // BigInt: o produto passa de 2^53 só com valores absurdos, mas a conta fica exata sempre.
  const advanceCents = Number((BigInt(netCents) * BigInt(percent)) / 100n);
  return { advanceCents, restCents: netCents - advanceCents };
}

/** A porcentagem que gera esse adiantamento (para abrir a edição de um salário dividido). */
export function inferAdvancePercent(advanceCents: number, totalCents: number): number {
  if (totalCents <= 0) return DEFAULT_ADVANCE_PERCENT;
  for (let p = 1; p <= 99; p++) {
    if (splitSalary(totalCents, p).advanceCents === advanceCents) return p;
  }
  return Math.min(99, Math.max(1, Math.round((advanceCents * 100) / totalCents)));
}

export type SalaryPayment =
  { mode: "single" } | { mode: "split"; advancePercent: number; advanceDay: number };

export interface SalaryItem {
  role: "advance" | "salary";
  amountCents: number;
  dayOfMonth: number;
  /** Primeiro mês: a próxima data que ainda não passou (nunca preenche o passado). */
  startMonth: MonthKey;
}

/**
 * Os fixos de um salário. `day` é o dia do salário (ou do resto, se dividido).
 * Dividido, cada parte começa na sua próxima data: em 25/09, o adiantamento do dia 20
 * fica para outubro e o resto do dia 5 também.
 */
export function planSalary(
  netCents: number,
  day: number,
  payment: SalaryPayment,
  today: DateOnly,
): { ok: true; items: SalaryItem[] } | { ok: false; error: "too_small" } {
  if (payment.mode === "single") {
    return {
      ok: true,
      items: [
        {
          role: "salary",
          amountCents: netCents,
          dayOfMonth: day,
          startMonth: firstMonthFor(day, today, false),
        },
      ],
    };
  }
  const { advanceCents, restCents } = splitSalary(netCents, payment.advancePercent);
  if (advanceCents < 1 || restCents < 1) return { ok: false, error: "too_small" };
  return {
    ok: true,
    items: [
      {
        role: "advance",
        amountCents: advanceCents,
        dayOfMonth: payment.advanceDay,
        startMonth: firstMonthFor(payment.advanceDay, today, false),
      },
      {
        role: "salary",
        amountCents: restCents,
        dayOfMonth: day,
        startMonth: firstMonthFor(day, today, false),
      },
    ],
  };
}

/** Primeira data de uma parte, para a frase "A primeira vez entra em 5 de outubro." */
export function firstDate(item: Pick<SalaryItem, "dayOfMonth" | "startMonth">): DateOnly {
  return clampDay(item.startMonth, item.dayOfMonth);
}
