import { addMonths, clampDay, type DateOnly, monthDiff, type MonthKey, monthOf } from "@/lib/dates";

/**
 * Fixos: rendas e gastos que se repetem (docs/design-system/17-padroes-de-tela.md#rendas-e-gastos-fixos).
 * Uma ocorrência por mês, no dia marcado (ajustado ao tamanho do mês), de startMonth
 * até endMonth (nulo = sem fim). Parcelas e "só uma vez" são só um endMonth.
 */

export type RepeatMode =
  { mode: "monthly" } | { mode: "installments"; count: number } | { mode: "once" };

export interface RecurringRule {
  dayOfMonth: number;
  startMonth: MonthKey;
  endMonth: MonthKey | null;
}

export const RECURRING_LIMIT = 100;
export const MAX_INSTALLMENTS = 120;
/** No máximo tantas ocorrências de uma vez (quem ficou meses sem abrir o app). */
export const MAX_CATCH_UP = 24;

export function endMonthFor(startMonth: MonthKey, repeat: RepeatMode): MonthKey | null {
  if (repeat.mode === "monthly") return null;
  if (repeat.mode === "once") return startMonth;
  return addMonths(startMonth, repeat.count - 1);
}

export function repeatOf(rule: RecurringRule): RepeatMode {
  if (rule.endMonth === null) return { mode: "monthly" };
  const count = monthDiff(rule.startMonth, rule.endMonth) + 1;
  return count === 1 ? { mode: "once" } : { mode: "installments", count };
}

export function occurrenceDate(rule: RecurringRule, month: MonthKey): DateOnly {
  return clampDay(month, rule.dayOfMonth);
}

export function isActiveIn(rule: RecurringRule, month: MonthKey): boolean {
  return month >= rule.startMonth && (rule.endMonth === null || month <= rule.endMonth);
}

/** A ocorrência seguinte a um mês, ou nulo se o fixo acabou. */
export function nextAfter(rule: RecurringRule, month: MonthKey): DateOnly | null {
  const next = addMonths(month, 1);
  if (rule.endMonth !== null && next > rule.endMonth) return null;
  return occurrenceDate(rule, next < rule.startMonth ? rule.startMonth : next);
}

/**
 * Ocorrências que já venceram até hoje, a partir da próxima pendente.
 * Devolve também a nova "próxima ocorrência" (nulo se o fixo terminou).
 */
export function dueOccurrences(
  rule: RecurringRule,
  nextOccurrenceOn: DateOnly | null,
  today: DateOnly,
  max = MAX_CATCH_UP,
): { due: Array<{ month: MonthKey; date: DateOnly }>; next: DateOnly | null } {
  const due: Array<{ month: MonthKey; date: DateOnly }> = [];
  let next = nextOccurrenceOn;
  while (next !== null && next <= today && due.length < max) {
    const month = monthOf(next);
    due.push({ month, date: next });
    next = nextAfter(rule, month);
  }
  return { due, next };
}

/**
 * Primeira ocorrência de um fixo novo: nunca preenche meses passados. Se o dia deste
 * mês já passou, começa no mês que vem, a não ser que a pessoa peça "Anotar agora".
 */
export function firstMonthFor(
  dayOfMonth: number,
  today: DateOnly,
  includeThisMonth: boolean,
): MonthKey {
  const month = monthOf(today);
  const thisMonthDate = clampDay(month, dayOfMonth);
  if (thisMonthDate >= today || includeThisMonth) return month;
  return addMonths(month, 1);
}

/** O dia deste mês já passou? (a tela pergunta "Já anotou o de setembro?") */
export function dayAlreadyPassed(dayOfMonth: number, today: DateOnly): boolean {
  return clampDay(monthOf(today), dayOfMonth) < today;
}
