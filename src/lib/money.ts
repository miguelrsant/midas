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
