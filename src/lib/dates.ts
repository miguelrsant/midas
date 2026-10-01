/**
 * Datas no fuso America/Sao_Paulo (docs/design-system/11-conteudo-e-tom.md#datas-e-horas).
 *
 * Datas sem hora (dia de um lançamento, vencimentos) são texto "AAAA-MM-DD" (`DateOnly`)
 * e meses são "AAAA-MM" (`MonthKey`). A conta com elas é feita em inteiros, sem fuso:
 * "hoje" é calculado uma vez, em São Paulo, e passado adiante como parâmetro.
 * No banco, colunas `date`; a conversão para `Date` só acontece em `toDbDate`/`fromDbDate`.
 */

export const TIME_ZONE = "America/Sao_Paulo";

/** "2026-09-30" */
export type DateOnly = string & { readonly __brand?: "DateOnly" };
/** "2026-09" */
export type MonthKey = string & { readonly __brand?: "MonthKey" };

const shortDate = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

/** "30/09/2026", para instantes (com hora), no fuso de Brasília. */
export function formatShortDate(date: Date) {
  return shortDate.format(date);
}

const isoParts = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** O dia de hoje em São Paulo, como "AAAA-MM-DD". */
export function todayInSaoPaulo(now: Date = new Date()): DateOnly {
  return isoParts.format(now);
}

const DATE_RE = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const MONTH_RE = /^(\d{4})-(0[1-9]|1[0-2])$/;

export function isLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year: number, month: number) {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

export function isDateOnly(value: string): value is DateOnly {
  const m = DATE_RE.exec(value);
  if (!m) return false;
  return Number(m[3]) <= daysInMonth(Number(m[1]), Number(m[2]));
}

export function isMonthKey(value: string): value is MonthKey {
  return MONTH_RE.test(value);
}

export function parseDate(value: DateOnly): { year: number; month: number; day: number } {
  if (!isDateOnly(value)) throw new Error("Data inválida");
  return {
    year: Number(value.slice(0, 4)),
    month: Number(value.slice(5, 7)),
    day: Number(value.slice(8, 10)),
  };
}

export function parseMonth(value: MonthKey): { year: number; month: number } {
  if (!isMonthKey(value)) throw new Error("Mês inválido");
  return { year: Number(value.slice(0, 4)), month: Number(value.slice(5, 7)) };
}

const pad = (n: number, size = 2) => String(n).padStart(size, "0");

export function makeDate(year: number, month: number, day: number): DateOnly {
  return `${pad(year, 4)}-${pad(month)}-${pad(day)}`;
}

export function makeMonth(year: number, month: number): MonthKey {
  return `${pad(year, 4)}-${pad(month)}`;
}

export function monthOf(date: DateOnly): MonthKey {
  return date.slice(0, 7);
}

/** Soma meses a um mês ("2026-12" + 1 = "2027-01"). */
export function addMonths(month: MonthKey, count: number): MonthKey {
  const { year, month: m } = parseMonth(month);
  const index = year * 12 + (m - 1) + count;
  return makeMonth(Math.floor(index / 12), (index % 12) + 1);
}

/** Diferença em meses: b − a. */
export function monthDiff(a: MonthKey, b: MonthKey): number {
  const pa = parseMonth(a);
  const pb = parseMonth(b);
  return pb.year * 12 + pb.month - (pa.year * 12 + pa.month);
}

/** O dia pedido, ajustado ao tamanho do mês (31 em fevereiro vira 28 ou 29). */
export function clampDay(month: MonthKey, day: number): DateOnly {
  const { year, month: m } = parseMonth(month);
  return makeDate(year, m, Math.min(Math.max(1, day), daysInMonth(year, m)));
}

export function firstDay(month: MonthKey): DateOnly {
  return `${month}-01`;
}

export function lastDay(month: MonthKey): DateOnly {
  const { year, month: m } = parseMonth(month);
  return makeDate(year, m, daysInMonth(year, m));
}

/** Número de dias desde 1970-01-01, para somar dias sem fuso. */
function toDayNumber(date: DateOnly) {
  const { year, month, day } = parseDate(date);
  return Math.round(Date.UTC(year, month - 1, day) / 86_400_000);
}

function fromDayNumber(n: number): DateOnly {
  const d = new Date(n * 86_400_000);
  return makeDate(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

export function addDays(date: DateOnly, count: number): DateOnly {
  return fromDayNumber(toDayNumber(date) + count);
}

/** Dias de a até b (b − a). */
export function dayDiff(a: DateOnly, b: DateOnly): number {
  return toDayNumber(b) - toDayNumber(a);
}

/** 0 = domingo. */
export function weekday(date: DateOnly): number {
  return (toDayNumber(date) + 4) % 7;
}

/** Converte para gravar numa coluna `date` (sempre meia-noite UTC). */
export function toDbDate(date: DateOnly): Date {
  if (!isDateOnly(date)) throw new Error("Data inválida");
  return new Date(`${date}T00:00:00.000Z`);
}

/** Lê uma coluna `date` (o Prisma devolve meia-noite UTC). */
export function fromDbDate(date: Date): DateOnly {
  return date.toISOString().slice(0, 10);
}

export const MONTH_NAMES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
] as const;

const MONTH_ABBR = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];
const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

const capitalize = (text: string) => text.charAt(0).toLocaleUpperCase("pt-BR") + text.slice(1);

/** "setembro" */
export function monthName(month: MonthKey): string {
  return MONTH_NAMES[parseMonth(month).month - 1]!;
}

/** "Setembro 2026" (topo da tela). */
export function monthTitle(month: MonthKey): string {
  const { year } = parseMonth(month);
  return `${capitalize(monthName(month))} ${year}`;
}

/** "Setembro de 2026" (título do resumo). */
export function monthLongTitle(month: MonthKey): string {
  const { year } = parseMonth(month);
  return `${capitalize(monthName(month))} de ${year}`;
}

/** "Set" (eixo do gráfico, sem ponto). */
export function monthAbbr(month: MonthKey): string {
  return capitalize(MONTH_ABBR[parseMonth(month).month - 1]!);
}

/** "30 de setembro" */
export function formatDayMonth(date: DateOnly): string {
  const { month, day } = parseDate(date);
  return `${day} de ${MONTH_NAMES[month - 1]}`;
}

/** "30 set" */
export function formatDayMonthShort(date: DateOnly): string {
  const { month, day } = parseDate(date);
  return `${day} ${MONTH_ABBR[month - 1]}`;
}

/**
 * Data de um lançamento na meta da linha: "hoje", "ontem", "5 set" ou "5 set 2025";
 * a forma longa ("5 de setembro") é para o leitor de tela.
 */
export function formatEntryDate(date: DateOnly, today: DateOnly): { short: string; long: string } {
  const diff = dayDiff(date, today);
  if (diff === 0) return { short: "hoje", long: "hoje" };
  if (diff === 1) return { short: "ontem", long: "ontem" };
  const { year } = parseDate(date);
  const sameYear = year === parseDate(today).year;
  return {
    short: sameYear ? formatDayMonthShort(date) : `${formatDayMonthShort(date)} ${year}`,
    long: sameYear ? formatDayMonth(date) : `${formatDayMonth(date)} de ${year}`,
  };
}

/** Cabeçalho de dia na lista: "Hoje", "Ontem", "Sábado, 26 de setembro". */
export function formatDayHeading(date: DateOnly, today: DateOnly): string {
  const diff = dayDiff(date, today);
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Ontem";
  if (diff === -1) return "Amanhã";
  const { year } = parseDate(date);
  const base = `${WEEKDAYS[weekday(date)]}, ${formatDayMonth(date)}`;
  return year === parseDate(today).year ? base : `${base} de ${year}`;
}
