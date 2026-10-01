import { OTHER_EXPENSE, OTHER_INCOME } from "@/lib/categories";
import { type DateOnly, type MonthKey, monthOf } from "@/lib/dates";
import type { EntryKind } from "@/lib/entry";
import { floorPercent } from "@/lib/money";

/**
 * Gastos (ou rendas) por categoria e as fatias da rosca
 * (docs/design-system/13-graficos-e-dados.md#rosca-por-categoria). Código puro, em centavos.
 */

/** Quantas categorias a rosca mostra antes de juntar o resto em "Outros". */
export const MAX_SLICES = 6;

export function totalsByCategory(
  entries: Iterable<{ kind: EntryKind; categoryId: string; amountCents: number; date: DateOnly }>,
  kind: EntryKind,
  month?: MonthKey,
): Map<string, number> {
  const map = new Map<string, number>();
  for (const e of entries) {
    if (e.kind !== kind || (month && monthOf(e.date) !== month)) continue;
    map.set(e.categoryId, (map.get(e.categoryId) ?? 0) + e.amountCents);
  }
  return map;
}

export interface Slice {
  /** Id da categoria, ou "outros" para a fatia que junta o resto. */
  key: string;
  categoryIds: string[];
  cents: number;
  /** Porcentagem do total, arredondada para baixo (para mostrar). */
  percent: number;
  /** A fatia "Outros": a categoria Outros e as menores, juntas. Sempre a última. */
  other: boolean;
}

/**
 * Fatias da maior para a menor (empate pelo id, para a ordem não pular). Até
 * `MAX_SLICES` categorias, todas aparecem; com mais, as cinco maiores e "Outros".
 * A categoria Outros da pessoa entra sempre na fatia "Outros".
 */
export function topSlices(totals: ReadonlyMap<string, number>): Slice[] {
  const items = [...totals.entries()]
    .filter(([, cents]) => cents > 0)
    .map(([categoryId, cents]) => ({ categoryId, cents }));
  const sum = items.reduce((s, i) => s + i.cents, 0);
  const isOther = (id: string) => id === OTHER_EXPENSE || id === OTHER_INCOME;
  const named = items
    .filter((i) => !isOther(i.categoryId))
    .sort((a, b) => b.cents - a.cents || a.categoryId.localeCompare(b.categoryId));
  const others = items.filter((i) => isOther(i.categoryId));
  const fits = named.length + (others.length > 0 ? 1 : 0) <= MAX_SLICES;
  const shown = fits ? named : named.slice(0, MAX_SLICES - 1);
  const rest = [...(fits ? [] : named.slice(MAX_SLICES - 1)), ...others];

  const slices: Slice[] = shown.map((i) => ({
    key: i.categoryId,
    categoryIds: [i.categoryId],
    cents: i.cents,
    percent: floorPercent(i.cents, sum),
    other: false,
  }));
  if (rest.length > 0) {
    const cents = rest.reduce((s, i) => s + i.cents, 0);
    slices.push({
      key: "outros",
      categoryIds: rest.map((i) => i.categoryId),
      cents,
      percent: floorPercent(cents, sum),
      other: true,
    });
  }
  return slices;
}

export interface Arc {
  /** `stroke-dasharray` num círculo de perímetro 100: "fatia espaço". */
  dash: string;
  /** `stroke-dashoffset`: onde a fatia começa, a partir do topo. */
  offset: number;
}

/**
 * Arcos da rosca num círculo de perímetro 100, começando no topo, em sentido horário,
 * com `gap` de espaço entre fatias. Uma fatia só fecha o círculo, sem espaço.
 */
export function donutArcs(slices: readonly { cents: number }[], gap = 1): Arc[] {
  const sum = slices.reduce((s, x) => s + x.cents, 0);
  if (sum <= 0) return [];
  if (slices.length === 1) return [{ dash: "100 0", offset: 25 }];
  let start = 0;
  return slices.map((x) => {
    const share = (x.cents / sum) * 100;
    const length = Math.max(0, share - gap);
    // Começa no topo (o traço do círculo começa às 3 horas: +25).
    const arc = { dash: `${round(length)} ${round(100 - length)}`, offset: round(25 - start) };
    start += share;
    return arc;
  });
}

const round = (n: number) => Math.round(n * 1000) / 1000;
