import type { Route } from "next";
import Link from "next/link";

import { type Category, findCategory } from "@/lib/categories";
import { type DateOnly, formatDayHeading, formatEntryDate } from "@/lib/dates";
import type { EntryView } from "@/lib/data/entries";

import { CategoryIcon } from "./category-icon";
import { Highlightable } from "./golden-touch";
import { Money } from "./money";

/**
 * Linhas de lançamento (docs/design-system/componentes/transaction-row.md): a linha inteira
 * é um link para editar. Título é a descrição ou, sem ela, o nome da categoria.
 */

export type RowEntry = Pick<
  EntryView,
  "id" | "kind" | "amountCents" | "categoryId" | "description" | "date" | "recurringId"
>;

export function TransactionRow({
  entry,
  categories,
  today,
  hideDate = false,
}: {
  entry: RowEntry;
  categories: readonly Category[];
  today: DateOnly;
  hideDate?: boolean;
}) {
  const category = findCategory(categories, entry.categoryId);
  const date = formatEntryDate(entry.date, today);
  const title = entry.description || category.name;
  return (
    <li className="border-b border-veio last:border-b-0">
      <Highlightable id={entry.id}>
        <Link
          href={`/lancamentos/${entry.id}` as Route}
          className="grid min-h-16 grid-cols-[44px_1fr_auto] items-center gap-3 px-2 py-2 hover:bg-superficie-funda focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foco"
        >
          <CategoryIcon icon={category.icon} kind={entry.kind} />
          <span className="min-w-0">
            <span className="block truncate text-body font-semibold text-tinta">{title}</span>
            <span className="block text-caption text-tinta-suave">
              {category.name}
              {entry.recurringId ? (
                <>
                  <span aria-hidden="true"> · </span>
                  <span className="md-sr">, </span>Fixo
                </>
              ) : null}
              {hideDate ? null : (
                <>
                  <span aria-hidden="true"> · </span>
                  <span className="md-sr">, </span>
                  <span aria-hidden="true">{date.short}</span>
                  <span className="md-sr">{date.long}</span>
                </>
              )}
            </span>
          </span>
          <Money cents={entry.amountCents} kind={entry.kind} className="font-mono text-amount" />
        </Link>
      </Highlightable>
    </li>
  );
}

export function TransactionList({
  entries,
  categories,
  today,
}: {
  entries: readonly RowEntry[];
  categories: readonly Category[];
  today: DateOnly;
}) {
  return (
    <ul className="flex flex-col">
      {entries.map((entry) => (
        <TransactionRow key={entry.id} entry={entry} categories={categories} today={today} />
      ))}
    </ul>
  );
}

/** Lista agrupada por dia, do mais novo para o mais antigo, com o total do dia. */
export function DayGroups({
  entries,
  categories,
  today,
}: {
  entries: readonly RowEntry[];
  categories: readonly Category[];
  today: DateOnly;
}) {
  const days = new Map<DateOnly, RowEntry[]>();
  for (const entry of entries) {
    const list = days.get(entry.date) ?? [];
    list.push(entry);
    days.set(entry.date, list);
  }
  return (
    <div className="flex flex-col gap-6">
      {[...days.entries()].map(([day, list]) => {
        const net = list.reduce(
          (sum, e) => sum + (e.kind === "income" ? e.amountCents : -e.amountCents),
          0,
        );
        const headingId = `dia-${day}`;
        return (
          <section key={day} aria-labelledby={headingId}>
            <div className="flex items-baseline justify-between gap-2 px-2 pb-1">
              <h2 id={headingId} className="text-label text-tinta-suave">
                {formatDayHeading(day, today)}
              </h2>
              <span className="text-caption text-tinta-suave">
                <span className="md-sr">Total do dia: </span>
                <Money cents={net} />
              </span>
            </div>
            <ul className="flex flex-col rounded-lg bg-superficie px-2 shadow-cartao">
              {list.map((entry) => (
                <TransactionRow
                  key={entry.id}
                  entry={entry}
                  categories={categories}
                  today={today}
                  hideDate
                />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
