import { CALCULATOR_CATEGORY_IDS } from "@/lib/categories";
import { addMonths, type DateOnly, type MonthKey, monthOf, parseDate } from "@/lib/dates";
import type { EntryKind } from "@/lib/entry";
import { mulDivRound } from "@/lib/money";

import { isActiveIn, occurrenceDate, type RecurringRule } from "./recurring";

/**
 * Projeção dos próximos meses (docs/design-system/13-graficos-e-dados.md#projeção-como-é-calculada-e-como-é-explicada).
 * Sempre estimativa. Recebe "hoje" como parâmetro e nunca lê o relógio.
 */

export interface EntryFact {
  kind: EntryKind;
  amountCents: number;
  categoryId: string;
  date: DateOnly;
  /** Criado por um fixo (fica fora da média de variáveis). */
  fromRecurring: boolean;
}

export interface RecurringFact extends RecurringRule {
  kind: EntryKind;
  amountCents: number;
}

export interface ExpectedFact {
  amountCents: number;
  dueDate: DateOnly;
  categoryId: string;
}

export interface MonthPoint {
  month: MonthKey;
  incomeCents: number;
  expenseCents: number;
  projected: boolean;
  current?: boolean;
  hasThirteenth?: boolean;
}

export interface MonthTotals {
  incomeCents: number;
  expenseCents: number;
  variableIncomeCents: number;
  variableExpenseCents: number;
  count: number;
}

const empty = (): MonthTotals => ({
  incomeCents: 0,
  expenseCents: 0,
  variableIncomeCents: 0,
  variableExpenseCents: 0,
  count: 0,
});

export function totalsByMonth(entries: readonly EntryFact[]): Map<MonthKey, MonthTotals> {
  const map = new Map<MonthKey, MonthTotals>();
  for (const e of entries) {
    const month = monthOf(e.date);
    const t = map.get(month) ?? empty();
    const variable = !e.fromRecurring && !CALCULATOR_CATEGORY_IDS.has(e.categoryId);
    if (e.kind === "income") {
      t.incomeCents += e.amountCents;
      if (variable) t.variableIncomeCents += e.amountCents;
    } else {
      t.expenseCents += e.amountCents;
      if (variable) t.variableExpenseCents += e.amountCents;
    }
    t.count++;
    map.set(month, t);
  }
  return map;
}

/**
 * Meses de referência: os últimos 3 meses fechados que têm lançamentos, dentro dos
 * últimos 6. O primeiro mês de uso só entra se o primeiro lançamento foi até o dia 7.
 */
export function referenceMonths(
  totals: ReadonlyMap<MonthKey, MonthTotals>,
  today: DateOnly,
  firstEntryDate: DateOnly | null,
): MonthKey[] {
  if (!firstEntryDate) return [];
  const current = monthOf(today);
  const firstMonth = monthOf(firstEntryDate);
  const skipFirst = parseDate(firstEntryDate).day > 7;
  const result: MonthKey[] = [];
  for (let i = 1; i <= 6 && result.length < 3; i++) {
    const month = addMonths(current, -i);
    if (month < firstMonth || (skipFirst && month === firstMonth)) break;
    if ((totals.get(month)?.count ?? 0) > 0) result.push(month);
  }
  return result.reverse();
}

export interface ProjectionInput {
  today: DateOnly;
  entries: readonly EntryFact[];
  firstEntryDate: DateOnly | null;
  recurrings: readonly RecurringFact[];
  expected: readonly ExpectedFact[];
}

export interface Projection {
  totals: Map<MonthKey, MonthTotals>;
  reference: MonthKey[];
  averageVariableIncome: number;
  averageVariableExpense: number;
  /** Projeção de um mês futuro; null sem meses de referência. */
  future: (month: MonthKey) => MonthPoint | null;
  /** Estimativa do mês atual até o fim. */
  currentEstimate: { incomeCents: number; expenseCents: number } | null;
  hasFixedIncome: boolean;
}

function fixedIn(recurrings: readonly RecurringFact[], month: MonthKey, kind: EntryKind) {
  return recurrings
    .filter((r) => r.kind === kind && isActiveIn(r, month))
    .reduce((sum, r) => sum + r.amountCents, 0);
}

function expectedIn(expected: readonly ExpectedFact[], month: MonthKey) {
  const inMonth = expected.filter((e) => monthOf(e.dueDate) === month);
  return {
    cents: inMonth.reduce((sum, e) => sum + e.amountCents, 0),
    hasThirteenth: inMonth.some((e) => e.categoryId === "decimo-terceiro"),
  };
}

export function buildProjection(input: ProjectionInput): Projection {
  const totals = totalsByMonth(input.entries);
  const reference = referenceMonths(totals, input.today, input.firstEntryDate);
  const n = reference.length;
  const avg = (pick: (t: MonthTotals) => number) =>
    n === 0
      ? 0
      : mulDivRound(
          reference.reduce((s, m) => s + pick(totals.get(m) ?? empty()), 0),
          1,
          n,
        );
  const averageVariableIncome = avg((t) => t.variableIncomeCents);
  const averageVariableExpense = avg((t) => t.variableExpenseCents);
  const current = monthOf(input.today);
  const hasFixedIncome = input.recurrings.some((r) => r.kind === "income");

  const future = (month: MonthKey): MonthPoint | null => {
    if (n === 0 || month <= current) return null;
    const fixedIncome = fixedIn(input.recurrings, month, "income");
    const exp = expectedIn(input.expected, month);
    const income = (fixedIncome > 0 ? fixedIncome : averageVariableIncome) + exp.cents;
    const expense = averageVariableExpense + fixedIn(input.recurrings, month, "expense");
    return {
      month,
      incomeCents: income,
      expenseCents: expense,
      projected: true,
      hasThirteenth: exp.hasThirteenth,
    };
  };

  let currentEstimate: Projection["currentEstimate"] = null;
  {
    const t = totals.get(current) ?? empty();
    const remaining = (kind: EntryKind) =>
      input.recurrings
        .filter(
          (r) =>
            r.kind === kind && isActiveIn(r, current) && occurrenceDate(r, current) > input.today,
        )
        .reduce((s, r) => s + r.amountCents, 0);
    const exp = expectedIn(input.expected, current).cents;
    const fixedIncomeThisMonth = fixedIn(input.recurrings, current, "income") > 0;
    const incomeCents =
      t.incomeCents +
      remaining("income") +
      exp +
      (n > 0 && !fixedIncomeThisMonth
        ? Math.max(0, averageVariableIncome - t.variableIncomeCents)
        : 0);
    const expenseCents =
      t.expenseCents +
      remaining("expense") +
      (n > 0 ? Math.max(0, averageVariableExpense - t.variableExpenseCents) : 0);
    currentEstimate = { incomeCents, expenseCents };
  }

  return {
    totals,
    reference,
    averageVariableIncome,
    averageVariableExpense,
    future,
    currentEstimate,
    hasFixedIncome,
  };
}

/** Pontos de um intervalo de meses: passados reais, atual real ("até agora"), futuros projetados. */
export function monthPoints(
  projection: Projection,
  months: readonly MonthKey[],
  today: DateOnly,
): MonthPoint[] {
  const current = monthOf(today);
  const points: MonthPoint[] = [];
  for (const month of months) {
    if (month <= current) {
      const t = projection.totals.get(month) ?? empty();
      points.push({
        month,
        incomeCents: t.incomeCents,
        expenseCents: t.expenseCents,
        projected: false,
        current: month === current,
      });
    } else {
      const p = projection.future(month);
      if (p) points.push(p);
    }
  }
  return points;
}
