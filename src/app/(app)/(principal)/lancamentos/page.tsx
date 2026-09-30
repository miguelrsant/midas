import type { Metadata, Route } from "next";
import Link from "next/link";

import { MonthSwitcher } from "@/components/midas/month-switcher";
import { Money } from "@/components/midas/money";
import { buttonClasses } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/dal";
import { listEntries } from "@/lib/data/entries";
import { resolveMonth } from "@/lib/data/months";
import { loadContext } from "@/lib/data/overview";
import { addMonths, monthName } from "@/lib/dates";

import { EntriesBrowser } from "./entries-browser";

export const metadata: Metadata = { title: "Lançamentos" };

/** "Onde eu gastei?" (docs/design-system/17-padroes-de-tela.md#lançamentos) */
export default async function EntriesPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const user = await requireUser();
  const { today, categories, firstEntryDate } = await loadContext(user.id);
  const { month, first, current, isCurrent } = resolveMonth((await searchParams).mes, {
    createdAt: user.createdAt,
    firstEntry: firstEntryDate,
  });
  const entries = await listEntries(user.id, month, month);
  const income = entries.filter((e) => e.kind === "income").reduce((s, e) => s + e.amountCents, 0);
  const expense = entries
    .filter((e) => e.kind === "expense")
    .reduce((s, e) => s + e.amountCents, 0);
  const previous = addMonths(month, -1);
  const here = isCurrent ? "/lancamentos" : `/lancamentos?mes=${month}`;

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex flex-col gap-3">
        <h1 className="font-display text-display-lg text-tinta">Lançamentos</h1>
        <MonthSwitcher month={month} first={first} last={current} basePath="/lancamentos" />
        <p className="text-body text-tinta">
          Entrou <Money cents={income} kind="income" /> <span aria-hidden="true">·</span> Saiu{" "}
          <Money cents={expense} kind="expense" />
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href={
              `/lancamentos/novo?de=${encodeURIComponent(here)}${isCurrent ? "" : `&mes=${month}`}` as Route
            }
            className={buttonClasses({ fullWidth: true })}
          >
            {isCurrent ? "Adicionar gasto" : `Adicionar lançamento em ${monthName(month)}`}
          </Link>
          <Link
            href={`/resumo/${month}` as Route}
            className={buttonClasses({ variant: "secondary", fullWidth: true })}
          >
            Ver resumo de {monthName(month)}
          </Link>
        </div>
      </div>

      <EntriesBrowser
        entries={entries.map(
          ({ id, kind, amountCents, categoryId, description, date, recurringId }) => ({
            id,
            kind,
            amountCents,
            categoryId,
            description,
            date,
            recurringId,
          }),
        )}
        categories={categories}
        today={today}
        monthName={monthName(month)}
        isCurrent={isCurrent}
      />

      {month > first ? (
        <Link
          href={`/lancamentos?mes=${previous}` as Route}
          className={buttonClasses({ variant: "secondary" })}
        >
          Ver {monthName(previous)}
        </Link>
      ) : null}
    </div>
  );
}
