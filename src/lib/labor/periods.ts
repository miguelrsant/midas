import {
  addDays,
  clampDay,
  type DateOnly,
  dayDiff,
  daysInMonth,
  makeDate,
  makeMonth,
  parseDate,
} from "@/lib/dates";

/**
 * Contagem de meses ("avos") das verbas trabalhistas.
 * - 13º: mês do calendário em que a pessoa trabalhou 15 dias ou mais (Lei 4.090/1962,
 *   art. 1º, § 2º).
 * - Férias proporcionais: meses contados do aniversário da admissão, mais um se a
 *   fração passar de 14 dias (CLT, art. 146, parágrafo único).
 */

/** Meses do ano com 15 dias ou mais trabalhados entre `start` e `end` (inclusive). */
export function thirteenthMonths(year: number, start: DateOnly, end: DateOnly): number {
  let count = 0;
  for (let month = 1; month <= 12; month++) {
    const monthStart = makeDate(year, month, 1);
    const monthEnd = makeDate(year, month, daysInMonth(year, month));
    const from = start > monthStart ? start : monthStart;
    const to = end < monthEnd ? end : monthEnd;
    if (from > to) continue;
    if (dayDiff(from, to) + 1 >= 15) count++;
  }
  return count;
}

/** A mesma data n meses depois, com o dia ajustado ao fim do mês. */
export function addMonthsToDate(date: DateOnly, months: number): DateOnly {
  const { year, month, day } = parseDate(date);
  const index = year * 12 + (month - 1) + months;
  return clampDay(makeMonth(Math.floor(index / 12), (index % 12) + 1), day);
}

/** Anos completos de serviço entre a admissão e a data. */
export function fullYears(admission: DateOnly, date: DateOnly): number {
  let years = 0;
  while (addMonthsToDate(admission, (years + 1) * 12) <= addDays(date, 1)) years++;
  return years;
}

/** Meses completos de serviço entre a admissão e a data. */
export function fullMonths(admission: DateOnly, date: DateOnly): number {
  let months = 0;
  while (addMonthsToDate(admission, months + 1) <= addDays(date, 1)) months++;
  return months;
}

/**
 * Avos de férias proporcionais: do último aniversário da admissão até `end`.
 * Mês completo conta 1; a fração final conta 1 se tiver 15 dias ou mais. No máximo 12.
 */
export function vacationMonths(admission: DateOnly, end: DateOnly): number {
  const years = fullYears(admission, end);
  const periodStart = addMonthsToDate(admission, years * 12);
  let months = 0;
  while (months < 12 && addMonthsToDate(periodStart, months + 1) <= addDays(end, 1)) months++;
  if (months < 12) {
    const fractionStart = addMonthsToDate(periodStart, months);
    if (dayDiff(fractionStart, end) + 1 >= 15) months++;
  }
  return Math.min(months, 12);
}
