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
> & {
  /**
   * Ainda não aconteceu (fixo que não chegou ao dia, renda prevista): aparece na lista
   * do mês com a etiqueta "vai cair" e leva ao fixo ou ao planejamento.
   */
  future?: { href: string; late: boolean };
};

export function TransactionRow({
  entry,
  categories,
  today,
  hideDate = false,
  backTo,
}: {
  entry: RowEntry;
  categories: readonly Category[];
  today: DateOnly;
  hideDate?: boolean;
  /** Tela para onde o "Voltar" da edição leva (vai como `?de=`). */
  backTo?: string;
}) {
  const category = findCategory(categories, entry.categoryId);
  const date = formatEntryDate(entry.date, today);
  const title = entry.description || category.name;
  return (
    <li className="border-b border-veio last:border-b-0">
      <Highlightable id={entry.id}>
        <Link
          href={
            (entry.future?.href ??
              `/lancamentos/${entry.id}${backTo ? `?de=${encodeURIComponent(backTo)}` : ""}`) as Route
          }
          className="grid min-h-16 grid-cols-[44px_1fr_auto] items-center gap-3 px-2 py-2 hover:bg-superficie-funda focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foco"
        >
          <CategoryIcon icon={category.icon} kind={entry.kind} />
          <span className="min-w-0">
            <span className="block truncate text-body font-semibold text-tinta">{title}</span>
            <span className="block text-caption text-tinta-suave">
              {entry.future ? (
                <span className="mr-2 inline-block rounded-pill border border-dashed border-borda px-2 font-semibold text-tinta">
                  {entry.future.late ? "atrasada" : "vai cair"}
                </span>
              ) : null}
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
          {entry.future ? (
            <span
              className={`font-mono text-amount whitespace-nowrap opacity-80 ${entry.kind === "income" ? "text-renda" : "text-gasto"}`}
            >
              <span className="md-sr">{entry.kind === "income" ? "Vai entrar " : "Vai sair "}</span>
              <span aria-hidden="true">{entry.kind === "income" ? "+ " : "− "}</span>
              <Money cents={entry.amountCents} />
            </span>
          ) : (
            <Money cents={entry.amountCents} kind={entry.kind} className="font-mono text-amount" />
          )}
        </Link>
      </Highlightable>
    </li>
  );
}

export function TransactionList({
  entries,
  categories,
  today,
  backTo,
}: {
  entries: readonly RowEntry[];
  categories: readonly Category[];
  today: DateOnly;
  backTo?: string;
}) {
  return (
    <ul className="flex flex-col">
      {entries.map((entry) => (
        <TransactionRow
          key={entry.id}
          entry={entry}
          categories={categories}
          today={today}
          backTo={backTo}
        />
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
        // O total do dia conta só o que já aconteceu.
        const real = list.filter((e) => !e.future);
        const net = real.reduce(
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
              {real.length > 0 ? (
                <span className="text-caption text-tinta-suave">
                  <span className="md-sr">Total do dia: </span>
                  <Money cents={net} />
                </span>
              ) : null}
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
