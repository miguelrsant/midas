import type { Route } from "next";
import Link from "next/link";

import { type Category, findCategory } from "@/lib/categories";
import { clampDay, type DateOnly, formatDayMonth, monthDiff, monthOf } from "@/lib/dates";
import type { RecurringView } from "@/lib/data/recurring";
import { repeatOf } from "@/lib/finance/recurring";

import { CategoryIcon } from "./category-icon";
import { Money } from "./money";

/** "todo dia 10", "3 de 10 parcelas", "só em 15 de dezembro", "terminou". */
export function recurringWhen(r: RecurringView, today: DateOnly) {
  const repeat = repeatOf(r);
  if (repeat.mode === "once")
    return `só em ${formatDayMonth(clampDay(r.startMonth, r.dayOfMonth))}`;
  if (repeat.mode === "installments") {
    if (!r.nextOccurrenceOn) return `${repeat.count} parcelas, terminou`;
    const done = Math.max(0, monthDiff(r.startMonth, monthOf(r.nextOccurrenceOn)));
    return `todo dia ${r.dayOfMonth} · ${done} de ${repeat.count} parcelas`;
  }
  if (!r.nextOccurrenceOn) return "terminou";
  return r.nextOccurrenceOn > today
    ? `todo dia ${r.dayOfMonth}`
    : `todo dia ${r.dayOfMonth}, anotando`;
}

export function RecurringList({
  items,
  categories,
  today,
}: {
  items: readonly RecurringView[];
  categories: readonly Category[];
  today: DateOnly;
}) {
  return (
    <ul className="flex flex-col">
      {items.map((r) => {
        const category = findCategory(categories, r.categoryId);
        return (
          <li key={r.id} className="border-b border-veio last:border-b-0">
            <Link
              href={`/planejamento/fixos/${r.id}` as Route}
              className="grid min-h-16 grid-cols-[44px_1fr_auto] items-center gap-3 px-2 py-2 hover:bg-superficie-funda focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foco"
            >
              <CategoryIcon icon={category.icon} kind={r.kind} />
              <span className="min-w-0">
                <span className="block truncate text-body font-semibold text-tinta">
                  {r.description || category.name}
                </span>
                <span className="block text-caption text-tinta-suave">
                  {recurringWhen(r, today)}
                </span>
              </span>
              <Money cents={r.amountCents} kind={r.kind} className="font-mono text-amount" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
