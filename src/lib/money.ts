/**
 * Dinheiro no Midas: sempre centavos inteiros. Converter para reais só para mostrar.
 * Regras de formato: docs/design-system/11-conteudo-e-tom.md#dinheiro
 * Regras de leitura: docs/design-system/componentes/money-input.md
 */

export const NBSP = " ";
export const MINUS = "−";

/** R$ 9.999.999,99: cabe em int4 no banco. */
export const MAX_CENTS = 999_999_999;

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const amountFmt = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export type MoneySign = "auto" | "always" | "never";

function assertCents(cents: number) {
  if (!Number.isSafeInteger(cents)) throw new Error("Valor em centavos precisa ser inteiro");
}

/**
 * Formata centavos inteiros: "R$ 1.234,56", com espaço inseparável.
 * sign: "auto" mostra − só em negativos; "always" mostra + e −; "never" não mostra sinal.
 */
export function formatMoney(cents: number, { sign = "auto" }: { sign?: MoneySign } = {}): string {
  assertCents(cents);
  const abs = brl.format(Math.abs(cents) / 100).replace(/\s/g, NBSP);
  if (sign === "never" || cents === 0) return abs;
  if (cents < 0) return `${MINUS}${NBSP}${abs}`;
  return sign === "always" ? `+${NBSP}${abs}` : abs;
}

/** "1.234,56", sem sinal e sem "R$": o texto do campo de valor ao sair. */
export function formatAmount(cents: number): string {
  assertCents(cents);
  return amountFmt.format(Math.abs(cents) / 100);
}

export type MoneyError = "empty" | "zero" | "sign" | "format" | "decimals" | "tooHigh";
export type MoneyRead = { ok: true; cents: number } | { ok: false; error: MoneyError };

export const MONEY_ERRORS: Record<MoneyError, string> = {
  empty: "Digite um valor maior que zero.",
  zero: "Digite um valor maior que zero.",
  sign: "Digite só o número, sem sinal.",
  format: "Use só números, com vírgula para os centavos.",
  decimals: "Use no máximo dois números depois da vírgula.",
  tooHigh: "Esse valor parece alto demais. Confira os números.",
};

/**
 * Lê o que a pessoa digitou ("1.234,56", "R$ 8,5", "12.50") e devolve centavos.
 * Vírgula é o decimal; ponto é milhar, exceto um único ponto seguido de 1 ou 2
 * dígitos no fim ("12.50"), que vira decimal. Nunca usa float para somar.
 */
export function readMoney(text: string): MoneyRead {
  const t = text.replace(/[\s ]/g, "").replace(/^R\$/i, "");
  if (t === "") return { ok: false, error: "empty" };
  if (/^[-−+]/.test(t)) return { ok: false, error: "sign" };
  if (!/^[\d.,]+$/.test(t)) return { ok: false, error: "format" };

  const parts = t.split(",");
  if (parts.length > 2) return { ok: false, error: "format" };

  let int: string;
  let frac: string;
  if (parts.length === 2) {
    int = (parts[0] ?? "").replaceAll(".", "");
    frac = parts[1] ?? "";
    if (frac.includes(".")) return { ok: false, error: "format" };
  } else {
    const decimal = /^(\d*)\.(\d{1,2})$/.exec(t);
    int = decimal ? (decimal[1] ?? "") : t.replaceAll(".", "");
    frac = decimal ? (decimal[2] ?? "") : "";
  }

  if (int === "" && frac === "") return { ok: false, error: "format" };
  if (frac.length > 2) return { ok: false, error: "decimals" };
  int = int.replace(/^0+/, "");
  if (int.length > 7) return { ok: false, error: "tooHigh" };

  const cents = Number(int || "0") * 100 + Number(frac.padEnd(2, "0"));
  if (cents === 0) return { ok: false, error: "zero" };
  if (cents > MAX_CENTS) return { ok: false, error: "tooHigh" };
  return { ok: true, cents };
}

export function parseMoney(text: string): number | null {
  const result = readMoney(text);
  return result.ok ? result.cents : null;
}

/** Soma centavos conferindo que o resultado continua inteiro e seguro. */
export function sumCents(values: Iterable<number>): number {
  let total = 0;
  for (const value of values) {
    assertCents(value);
    total += value;
  }
  assertCents(total);
  return total;
}

/**
 * a × num ÷ den com arredondamento meio para cima (longe do zero), só com inteiros.
 * Usado nas regras de dinheiro para nunca passar por float.
 */
export function mulDivRound(a: number, num: number, den: number): number {
  if (!Number.isSafeInteger(a) || !Number.isSafeInteger(num) || !Number.isSafeInteger(den)) {
    throw new Error("mulDivRound só aceita inteiros");
  }
  if (den === 0) throw new Error("Divisão por zero");
  const product = BigInt(a) * BigInt(num);
  const d = BigInt(den);
  const negative = product < 0n !== d < 0n;
  const absP = product < 0n ? -product : product;
  const absD = d < 0n ? -d : d;
  const q = (absP * 2n + absD) / (absD * 2n);
  const result = Number(negative ? -q : q);
  if (!Number.isSafeInteger(result)) throw new Error("Resultado grande demais");
  return result;
}

/** Arredonda à centena de reais (10.000 centavos), para projeções: "R$ 6.300". */
export function roundToHundredReais(cents: number): number {
  return mulDivRound(cents, 1, 10_000) * 10_000;
}

/** Arredonda ao real, para frases: "Sobraram R$ 1.842". */
export function roundToReais(cents: number): number {
  return mulDivRound(cents, 1, 100) * 100;
}

/** "R$ 1.842" (sem centavos), para frases de resumo. */
export function formatWholeMoney(cents: number): string {
  assertCents(cents);
  const reais = mulDivRound(Math.abs(cents), 1, 100);
  const text = `R$${NBSP}${new Intl.NumberFormat("pt-BR").format(reais)}`;
  return cents < 0 ? `${MINUS}${NBSP}${text}` : text;
}

/** Porcentagem inteira arredondada para baixo (nunca diz 100% se ainda sobra). */
export function floorPercent(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Number((BigInt(Math.max(0, part)) * 100n) / BigInt(whole));
}

const compact = new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 });

/** Eixo dos gráficos: "0", "4 mil", "1,2 mi" (sem "R$"). */
export function formatAxis(cents: number): string {
  return compact.format(Math.round(cents / 100)).replace(/\s/g, NBSP);
}

/** Valor com sinal e espaço inseparável, pronto para a interface. */
export function formatSigned(cents: number, kind: "income" | "expense"): string {
  return formatMoney(kind === "income" ? Math.abs(cents) : -Math.abs(cents), { sign: "always" });
}
