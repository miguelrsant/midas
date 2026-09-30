import "server-only";

import { isMonthKey, type MonthKey, monthOf, todayInSaoPaulo } from "@/lib/dates";

/**
 * Mês pedido na URL (?mes=2026-09), preso entre o primeiro mês com dados (criação da
 * conta ou lançamento mais antigo) e o mês atual (docs/design-system/componentes/app-header.md).
 */
export function resolveMonth(
  raw: string | undefined,
  { createdAt, firstEntry }: { createdAt: Date; firstEntry: string | null },
) {
  const today = todayInSaoPaulo();
  const current = monthOf(today);
  const created = monthOf(todayInSaoPaulo(createdAt));
  const firstEntryMonth = firstEntry ? monthOf(firstEntry) : created;
  const first: MonthKey = firstEntryMonth < created ? firstEntryMonth : created;
  let month: MonthKey = raw && isMonthKey(raw) ? raw : current;
  if (month > current) month = current;
  if (month < first) month = first;
  return { month, first, current, today, isCurrent: month === current };
}
