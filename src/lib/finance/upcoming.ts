import { type DateOnly, monthOf } from "@/lib/dates";
import type { EntryKind } from "@/lib/entry";

/**
 * O que ainda vai chegar no mês atual (docs/design-system/17-padroes-de-tela.md#lançamentos):
 * fixos cuja próxima vez cai até o fim do mês e rendas previstas das calculadoras
 * (as atrasadas também, até "Recebi" ou "Não recebi"). Código puro; "hoje" vem de fora.
 */

export interface Upcoming {
  key: string;
  source: "fixo" | "prevista";
  /** Id do fixo ou da renda prevista (para o link). */
  id: string;
  kind: EntryKind;
  amountCents: number;
  categoryId: string;
  /** Nome do fixo ou rótulo da prevista; nulo = nome da categoria. */
  title: string | null;
  date: DateOnly;
  /** Prevista com a data já passada. */
  late: boolean;
}

export function upcomingThisMonth(
  recurrings: ReadonlyArray<{
    id: string;
    kind: EntryKind;
    amountCents: number;
    categoryId: string;
    description: string | null;
    nextOccurrenceOn: DateOnly | null;
  }>,
  expected: ReadonlyArray<{
    id: string;
    amountCents: number;
    categoryId: string;
    label: string;
    dueDate: DateOnly;
  }>,
  today: DateOnly,
): Upcoming[] {
  const month = monthOf(today);
  const items: Upcoming[] = [];
  for (const r of recurrings) {
    const next = r.nextOccurrenceOn;
    if (!next || monthOf(next) !== month) continue;
    items.push({
      key: `fixo-${r.id}`,
      source: "fixo",
      id: r.id,
      kind: r.kind,
      amountCents: r.amountCents,
      categoryId: r.categoryId,
      title: r.description,
      date: next,
      late: false,
    });
  }
  for (const e of expected) {
    if (monthOf(e.dueDate) > month) continue;
    items.push({
      key: `prevista-${e.id}`,
      source: "prevista",
      id: e.id,
      kind: "income",
      amountCents: e.amountCents,
      categoryId: e.categoryId,
      title: e.label,
      date: e.dueDate,
      late: e.dueDate < today,
    });
  }
  return items.sort((a, b) => a.date.localeCompare(b.date) || a.key.localeCompare(b.key));
}
