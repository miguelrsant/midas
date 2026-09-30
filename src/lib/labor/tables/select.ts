import type { DateOnly } from "@/lib/dates";

export type TablePick<T> = { table: T; outdated: boolean };

/**
 * Escolhe a vigência que vale na data. Antes da primeira tabela: null (o Midas não
 * calcula). Depois da última vigência conhecida, usa a última, e `outdated` avisa
 * quando a data já passou do ano dela.
 */
export function pickTable<T extends { validFrom: DateOnly }>(
  tables: readonly T[],
  date: DateOnly,
): TablePick<T> | null {
  let chosen: T | null = null;
  for (const table of tables) {
    if (table.validFrom <= date) chosen = table;
  }
  if (!chosen) return null;
  const last = tables[tables.length - 1]!;
  const outdated = chosen === last && date.slice(0, 4) > last.validFrom.slice(0, 4);
  return { table: chosen, outdated };
}
