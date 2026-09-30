import "server-only";

import { cache } from "react";

import { type Category } from "@/lib/categories";
import { addMonths, type DateOnly, type MonthKey, monthOf, todayInSaoPaulo } from "@/lib/dates";
import { buildProjection, type EntryFact, type Projection } from "@/lib/finance/projection";

import { loadCategories } from "./categories";
import { entryFacts, firstEntryDate } from "./entries";
import { type ExpectedIncomeView, listExpectedIncomes } from "./planning";
import { ensureRecurringUpToDate, listRecurring, type RecurringView } from "./recurring";

/**
 * Contexto comum das telas logadas: hoje em São Paulo, categorias da pessoa e os
 * fixos já anotados até hoje. Uma vez por requisição.
 */
export const loadContext = cache(async (userId: string) => {
  const today = todayInSaoPaulo();
  await ensureRecurringUpToDate(userId, today);
  const [categories, first] = await Promise.all([loadCategories(userId), firstEntryDate(userId)]);
  return { today, categories, firstEntryDate: first };
});

export interface Overview {
  today: DateOnly;
  categories: Category[];
  firstEntryDate: DateOnly | null;
  facts: EntryFact[];
  recurrings: RecurringView[];
  expected: ExpectedIncomeView[];
  projection: Projection;
}

/** Fatos de `from` até hoje + fixos + previstas, e a projeção montada sobre eles. */
export async function loadOverview(userId: string, from: MonthKey): Promise<Overview> {
  const { today, categories, firstEntryDate: first } = await loadContext(userId);
  const current = monthOf(today);
  const start = from < addMonths(current, -6) ? from : addMonths(current, -6);
  const [facts, recurrings, expected] = await Promise.all([
    entryFacts(userId, start, current),
    listRecurring(userId),
    listExpectedIncomes(userId),
  ]);
  const pending = expected.filter((e) => e.dueDate.slice(0, 7) >= current);
  const projection = buildProjection({
    today,
    entries: facts,
    firstEntryDate: first,
    recurrings: recurrings.map((r) => ({ ...r })),
    expected: pending.map((e) => ({
      amountCents: e.amountCents,
      dueDate: e.dueDate,
      categoryId: e.categoryId,
    })),
  });
  return { today, categories, firstEntryDate: first, facts, recurrings, expected, projection };
}
