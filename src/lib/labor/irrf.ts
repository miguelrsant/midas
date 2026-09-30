import type { DateOnly } from "@/lib/dates";
import { mulDivRound } from "@/lib/money";

import { LaborInputError } from "./errors";
import { IRRF_MIN_WITHHOLDING_CENTS, IRRF_TABLES, type IrrfTable } from "./tables/irrf";
import { pickTable } from "./tables/select";

export interface IrrfInput {
  /** Renda tributável bruta do pagamento (antes do INSS). */
  grossCents: number;
  /** INSS descontado desse pagamento. */
  inssCents: number;
  dependents: number;
  /** Data do pagamento: escolhe a tabela. */
  paidOn: DateOnly;
  /** 13º salário: tributação exclusiva, sem a dispensa de retenção de até R$ 10. */
  exclusive?: boolean;
}

export interface IrrfResult {
  cents: number;
  /** Imposto pela tabela, antes da redução de 2026. */
  taxCents: number;
  reductionCents: number;
  baseCents: number;
  usedSimplified: boolean;
  table: IrrfTable;
  outdated: boolean;
}

/**
 * IRRF de um pagamento.
 * 1. Dedução: o maior entre as deduções legais (INSS + dependentes) e o desconto
 *    simplificado (IN RFB 2.141/2023: a fonte usa o mais vantajoso, inclusive em férias e 13º).
 * 2. Imposto pela tabela progressiva sobre a base.
 * 3. Redução da Lei 15.270/2025, calculada sobre a renda BRUTA (não sobre a base),
 *    limitada ao imposto; vale também para o 13º (§ 3º).
 * 4. Retenção de até R$ 10 dispensada, exceto no 13º (Lei 9.430/1996, art. 67).
 */
export function irrfFor(input: IrrfInput): IrrfResult {
  const pick = pickTable(IRRF_TABLES, input.paidOn);
  if (!pick) throw new LaborInputError("As tabelas do Midas começam em 2025.");
  const { table } = pick;
  const legal = input.inssCents + Math.max(0, input.dependents) * table.dependentCents;
  const usedSimplified = table.simplifiedCents > legal;
  const deduction = Math.max(legal, table.simplifiedCents);
  const base = Math.max(0, input.grossCents - deduction);

  const bracket =
    table.brackets.find((b) => b.upToCents === null || base <= b.upToCents) ??
    table.brackets.at(-1)!;
  const taxCents = Math.max(0, mulDivRound(base, bracket.rateBp, 10_000) - bracket.deductionCents);

  let reductionCents = 0;
  const r = table.reduction;
  if (r && taxCents > 0) {
    if (input.grossCents <= r.fullUpToCents) {
      reductionCents = Math.min(taxCents, r.fullMaxCents);
    } else if (input.grossCents <= r.partialUpToCents) {
      const partial = r.aCents - mulDivRound(input.grossCents, r.bPerMillion, 1_000_000);
      reductionCents = Math.min(taxCents, Math.max(0, partial));
    }
  }
  let cents = taxCents - reductionCents;
  if (!input.exclusive && cents <= IRRF_MIN_WITHHOLDING_CENTS) cents = 0;
  return {
    cents,
    taxCents,
    reductionCents,
    baseCents: base,
    usedSimplified,
    table,
    outdated: pick.outdated,
  };
}
