import type { DateOnly } from "@/lib/dates";

import { LaborInputError } from "./errors";
import { INSS_TABLES, type InssTable } from "./tables/inss";
import { pickTable } from "./tables/select";

export interface InssResult {
  cents: number;
  table: InssTable;
  outdated: boolean;
}

/**
 * Contribuição do empregado sobre uma remuneração, na tabela da competência.
 * Soma exata de cada faixa e um arredondamento só, no fim (meio para cima).
 */
export function inssFor(grossCents: number, competence: DateOnly): InssResult {
  const pick = pickTable(INSS_TABLES, competence);
  if (!pick) throw new LaborInputError("As tabelas do Midas começam em 2025.");
  let floor = 0;
  let total = 0n; // centavos × 10.000
  for (const { upToCents, rateBp } of pick.table.brackets) {
    if (grossCents <= floor) break;
    const slice = Math.min(grossCents, upToCents) - floor;
    total += BigInt(slice) * BigInt(rateBp);
    floor = upToCents;
  }
  const cents = Number((total + 5_000n) / 10_000n);
  return { cents, table: pick.table, outdated: pick.outdated };
}
