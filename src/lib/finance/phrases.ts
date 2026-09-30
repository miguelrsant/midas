import { type MonthKey, MONTH_NAMES, monthName, parseMonth } from "@/lib/dates";
import { floorPercent, formatMoney, formatWholeMoney, roundToHundredReais } from "@/lib/money";

import type { MonthPoint } from "./projection";

/**
 * Frases montadas no servidor (docs/design-system/11-conteudo-e-tom.md e
 * componentes/income-expense-chart.md#conteúdo). Projeção arredondada à centena;
 * sobra "deve", falta "pode"; mês real arredondado ao real.
 */

const cap = (text: string) => text.charAt(0).toLocaleUpperCase("pt-BR") + text.slice(1);

/** Nome do mês com maiúscula: "Setembro". */
export function monthLabel(month: MonthKey) {
  return cap(monthName(month));
}

export function chartTitle(points: readonly MonthPoint[]): string {
  const projected = points.filter((p) => p.projected);
  const negative = projected.find((p) => p.incomeCents - p.expenseCents < 0);
  if (negative) {
    const missing = roundToHundredReais(negative.expenseCents - negative.incomeCents);
    return `${monthLabel(negative.month)} pode fechar com ${formatWholeMoney(missing)} a menos.`;
  }
  const last = projected.at(-1);
  if (last) {
    const surplus = roundToHundredReais(last.incomeCents - last.expenseCents);
    return `${monthLabel(last.month)} deve fechar com ${formatWholeMoney(surplus)} de sobra.`;
  }
  const real = [...points].reverse().find((p) => !p.current) ?? points.at(-1);
  if (!real) return "Renda e gastos por mês.";
  const balance = real.incomeCents - real.expenseCents;
  const verb = real.current ? "vai" : "fechou";
  if (balance >= 0)
    return `${monthLabel(real.month)} ${verb} com ${formatWholeMoney(balance)} de sobra.`;
  return `${monthLabel(real.month)} ${verb} com ${formatWholeMoney(-balance)} a menos.`;
}

export function chartSummary(points: readonly MonthPoint[]): string {
  if (points.length === 0) return "Gráfico de renda e gastos sem dados.";
  const first = monthName(points[0]!.month);
  const last = monthName(points.at(-1)!.month);
  const projected = points.filter((p) => p.projected);
  const parts = [`Gráfico de barras de renda e gastos, de ${first} a ${last}.`];
  if (projected.length > 0) {
    parts.push(
      projected.length === 1
        ? `Em ${monthName(projected[0]!.month)}, os valores são projeção.`
        : `De ${monthName(projected[0]!.month)} a ${monthName(projected.at(-1)!.month)}, os valores são projeção.`,
    );
  }
  const deficit = points.filter((p) => p.incomeCents < p.expenseCents);
  parts.push(
    deficit.length === 0
      ? "A renda fica acima dos gastos em todos os meses."
      : `Os gastos passam da renda em ${deficit.map((p) => monthName(p.month)).join(", ")}.`,
  );
  return parts.join(" ");
}

export function projectionNote(
  reference: readonly MonthKey[],
  opts: { hasFixed: boolean; hasExpected: boolean; fixedIncomeOnly: boolean },
): string {
  const basis =
    reference.length >= 3
      ? "nos últimos 3 meses"
      : `em ${reference.map((m) => monthName(m)).join(" e ")}`;
  const extras = [
    opts.hasFixed ? "nos fixos" : null,
    opts.hasExpected ? "nas rendas já previstas, como o 13º" : null,
  ].filter(Boolean);
  let note = `Estimativa com base ${basis}${extras.length ? `, ${extras.join(" e ")}` : ""}.`;
  if (opts.fixedIncomeOnly)
    note += " Como você tem renda fixa, a estimativa conta só ela; ganhos avulsos não entram.";
  return note;
}

/** Título do painel: "Setembro vai bem." / "Setembro está apertado: faltam R$ 120 para fechar no azul." */
export function assessMonth(
  month: MonthKey,
  estimate: { incomeCents: number; expenseCents: number } | null,
  isCurrent: boolean,
) {
  const label = monthLabel(month);
  if (!estimate) return { text: label + ".", accent: null as string | null, good: true };
  const balance = estimate.incomeCents - estimate.expenseCents;
  if (isCurrent) {
    if (balance >= 0) return { text: `${label} vai `, accent: "bem", good: true };
    return {
      text: `${label} está apertado: faltam ${formatWholeMoney(-balance)} para fechar no azul.`,
      accent: null,
      good: false,
    };
  }
  if (balance >= 0) return { text: `${label} fechou `, accent: "no azul", good: true };
  return {
    text: `${label} fechou com ${formatWholeMoney(-balance)} a menos.`,
    accent: null,
    good: false,
  };
}

/** Frase do cartão de saldo (componentes/balance-card.md#conteúdo). */
export function balanceSentence(
  incomeCents: number,
  expenseCents: number,
  month: MonthKey,
  isCurrent: boolean,
) {
  const when = isCurrent ? "este mês" : `em ${monthName(month)}`;
  if (expenseCents === 0)
    return isCurrent
      ? "Você ainda não anotou gastos este mês."
      : `Nenhum gasto anotado em ${monthName(month)}.`;
  if (incomeCents === 0) return "Anote sua renda para ver quanto já foi gasto.";
  if (expenseCents === incomeCents) return `Você usou tudo o que entrou ${when}.`;
  if (expenseCents > incomeCents) return `Você gastou mais do que entrou ${when}.`;
  const pct = floorPercent(expenseCents, incomeCents);
  return pct < 1
    ? `Você usou menos de 1% do que entrou ${when}.`
    : `Você usou ${pct}% do que entrou ${when}.`;
}

/** Frase-resumo debaixo da saudação: "Sobraram R$ 1.842 até agora, R$ 310 a mais que em agosto." */
export function summarySentence(
  balance: number,
  previousBalance: number | null,
  month: MonthKey,
  isCurrent: boolean,
) {
  const when = isCurrent ? " até agora" : "";
  const main =
    balance >= 0
      ? `${balance === 100 ? "Sobrou" : "Sobraram"} ${formatWholeMoney(balance)}${when}`
      : `Faltaram ${formatWholeMoney(-balance)}${when}`;
  if (previousBalance === null) return `${main}.`;
  const diff = balance - previousBalance;
  const prev = MONTH_NAMES[(parseMonth(month).month + 10) % 12];
  if (Math.abs(diff) < 100) return `${main}, o mesmo que em ${prev}.`;
  return `${main}, ${formatWholeMoney(Math.abs(diff))} a ${diff > 0 ? "mais" : "menos"} que em ${prev}.`;
}

/** "R$ 360 de R$ 400 em setembro" */
export function limitPhrase(spent: number, limit: number) {
  return `${formatWholeMoney(spent)} de ${formatWholeMoney(limit)}`;
}

export function limitDetail(spent: number, limit: number) {
  if (spent > limit) return `Passou ${formatMoney(spent - limit)} do limite.`;
  if (spent === limit) return "Chegou ao limite.";
  return `Faltam ${formatMoney(limit - spent)}.`;
}
