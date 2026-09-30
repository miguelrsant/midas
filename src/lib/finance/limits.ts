/**
 * Limites por categoria (docs/design-system/15-categorias.md#limites-por-categoria).
 * Conta em centavos inteiros: 90% é gasto × 10 ≥ limite × 9.
 */

export type LimitState = "ok" | "near" | "reached" | "over";

export interface LimitStatus {
  state: LimitState;
  /** 0 a 100, para a barra (cheia acima de 100%). */
  percent: number;
  /** Quanto falta (≥ 0). */
  remainingCents: number;
  /** Quanto passou (≥ 0). */
  overCents: number;
}

export function limitStatus(spentCents: number, limitCents: number): LimitStatus {
  const over = Math.max(0, spentCents - limitCents);
  const remaining = Math.max(0, limitCents - spentCents);
  const percent =
    limitCents <= 0 ? 100 : Math.min(100, Math.floor((spentCents * 100) / limitCents));
  let state: LimitState = "ok";
  if (spentCents > limitCents) state = "over";
  else if (spentCents === limitCents) state = "reached";
  else if (spentCents * 10 >= limitCents * 9) state = "near";
  return { state, percent, remainingCents: remaining, overCents: over };
}

export interface LimitRow {
  categoryId: string;
  name: string;
  spentCents: number;
  limitCents: number;
}

/**
 * Um aviso só no painel: a categoria mais perto do limite (maior proporção) entre as
 * que passaram de 90%, e quantas outras também passaram.
 */
export function pickLimitNotice(
  rows: readonly LimitRow[],
): { row: LimitRow; status: LimitStatus; others: number } | null {
  const alerted = rows
    .map((row) => ({ row, status: limitStatus(row.spentCents, row.limitCents) }))
    .filter((r) => r.status.state !== "ok");
  if (alerted.length === 0) return null;
  alerted.sort((a, b) => b.row.spentCents * a.row.limitCents - a.row.spentCents * b.row.limitCents);
  return { ...alerted[0]!, others: alerted.length - 1 };
}
