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

/**
 * Camadas de uma barra: a parte fixa (fixos e rendas previstas das calculadoras), a
 * variável (o resto) e, no mês atual, o que ainda deve entrar ou sair até o fim do mês.
 */
export interface Layers {
  fixedCents: number;
  variableCents: number;
  pendingCents: number;
}

export interface MonthPoint {
  month: MonthKey;
  income: Layers;
  expense: Layers;
  /** Total da barra: fixa + variável + o que falta. */
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
  /** Projeção de um mês futuro (null para o mês atual ou passado). Sem meses de
   * referência, conta só os fixos e as rendas previstas. */
  future: (month: MonthKey) => MonthPoint | null;
  /** O mês atual: o real até hoje e o que ainda deve entrar ou sair até o fim. */
  currentPoint: MonthPoint;
  /** Estimativa do mês atual até o fim (os totais de `currentPoint`). */
  currentEstimate: { incomeCents: number; expenseCents: number };
  hasFixedIncome: boolean;
  /** Há meses fechados para tirar a média dos variáveis. */
  hasHistory: boolean;
  /** Dá para avisar que um mês "pode fechar no vermelho" sem assustar à toa: quem só
   * anotou gastos fixos, sem histórico nem renda fixa, ainda não tem renda na conta. */
  canWarnNegative: boolean;
}

const layers = (fixedCents: number, variableCents: number, pendingCents = 0): Layers => ({
  fixedCents,
  variableCents,
  pendingCents,
});

const total = (l: Layers) => l.fixedCents + l.variableCents + l.pendingCents;

function point(
  month: MonthKey,
  income: Layers,
  expense: Layers,
  extra: Pick<MonthPoint, "projected" | "current" | "hasThirteenth">,
): MonthPoint {
  return {
    month,
    income,
    expense,
    incomeCents: total(income),
    expenseCents: total(expense),
    ...extra,
  };
}

function fixedIn(recurrings: readonly RecurringFact[], month: MonthKey, kind: EntryKind) {
  return recurrings
    .filter((r) => r.kind === kind && isActiveIn(r, month))
    .reduce((sum, r) => sum + r.amountCents, 0);
}

/**
 * Rendas previstas que contam no mês. Uma prevista atrasada (vencida e ainda sem
 * "Recebi" ou "Não recebi") continua esperada no mês atual, nunca num mês que já passou.
 */
function expectedIn(expected: readonly ExpectedFact[], month: MonthKey, current: MonthKey) {
  const inMonth = expected.filter((e) => {
    const due = monthOf(e.dueDate);
    return (due < current ? current : due) === month;
  });
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
    if (month <= current) return null;
    const fixedIncome = fixedIn(input.recurrings, month, "income");
    const exp = expectedIn(input.expected, month, current);
    // Com renda fixa, a média de rendas variáveis fica de fora (não conta duas vezes).
    const income = layers(fixedIncome + exp.cents, fixedIncome > 0 ? 0 : averageVariableIncome);
    const expense = layers(fixedIn(input.recurrings, month, "expense"), averageVariableExpense);
    return point(month, income, expense, { projected: true, hasThirteenth: exp.hasThirteenth });
  };

  const t = totals.get(current) ?? empty();
  const remaining = (kind: EntryKind) =>
    input.recurrings
      .filter(
        (r) => r.kind === kind && isActiveIn(r, current) && occurrenceDate(r, current) > input.today,
      )
      .reduce((s, r) => s + r.amountCents, 0);
  const currentExpected = expectedIn(input.expected, current, current);
  const fixedIncomeThisMonth = fixedIn(input.recurrings, current, "income") > 0;
  const currentPoint = point(
    current,
    layers(
      t.incomeCents - t.variableIncomeCents,
      t.variableIncomeCents,
      remaining("income") +
        currentExpected.cents +
        (fixedIncomeThisMonth ? 0 : Math.max(0, averageVariableIncome - t.variableIncomeCents)),
    ),
    layers(
      t.expenseCents - t.variableExpenseCents,
      t.variableExpenseCents,
      remaining("expense") + Math.max(0, averageVariableExpense - t.variableExpenseCents),
    ),
    { projected: false, current: true, hasThirteenth: currentExpected.hasThirteenth },
  );

  return {
    totals,
    reference,
    averageVariableIncome,
    averageVariableExpense,
    future,
    currentPoint,
    currentEstimate: {
      incomeCents: currentPoint.incomeCents,
      expenseCents: currentPoint.expenseCents,
    },
    hasFixedIncome,
    hasHistory: n > 0,
    canWarnNegative: n > 0 || hasFixedIncome,
  };
}

/**
 * Pontos de um intervalo de meses: passados reais, o atual (real até hoje + o que
 * falta) e os futuros projetados.
 */
export function monthPoints(
  projection: Projection,
  months: readonly MonthKey[],
  today: DateOnly,
): MonthPoint[] {
  const current = monthOf(today);
  const points: MonthPoint[] = [];
  for (const month of months) {
    if (month < current) {
      const t = projection.totals.get(month) ?? empty();
      points.push(
        point(
          month,
          layers(t.incomeCents - t.variableIncomeCents, t.variableIncomeCents),
          layers(t.expenseCents - t.variableExpenseCents, t.variableExpenseCents),
          { projected: false },
        ),
      );
    } else if (month === current) {
      points.push(projection.currentPoint);
    } else {
      const p = projection.future(month);
      if (p) points.push(p);
    }
  }
  return points;
}
