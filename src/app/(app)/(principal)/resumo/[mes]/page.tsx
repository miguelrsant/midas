import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BalanceCard } from "@/components/midas/balance-card";
import { CategoryDonut } from "@/components/midas/category-donut";
import { TransactionList } from "@/components/midas/transaction-list";
import { buttonClasses } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/dal";
import { findCategory } from "@/lib/categories";
import { listEntries } from "@/lib/data/entries";
import { loadContext } from "@/lib/data/overview";
import { markSummaryOpened } from "@/lib/data/planning";
import { addMonths, isMonthKey, monthLongTitle, monthName, monthOf } from "@/lib/dates";
import { totalsByCategory } from "@/lib/finance/breakdown";
import { formatWholeMoney } from "@/lib/money";

export const metadata: Metadata = { title: "Resumo do mês" };

/** "Como foi o mês?" (docs/design-system/17-padroes-de-tela.md#resumo-do-mês) */
export default async function SummaryPage({ params }: { params: Promise<{ mes: string }> }) {
  const user = await requireUser();
  const { mes } = await params;
  if (!isMonthKey(mes)) notFound();
  const { today, categories } = await loadContext(user.id);
  const current = monthOf(today);
  if (mes > current) notFound();
  const previous = addMonths(mes, -1);
  const [entries, previousEntries] = await Promise.all([
    listEntries(user.id, mes, mes),
    listEntries(user.id, previous, previous),
  ]);
  // Abrir o resumo de um mês fechado encerra a conquista dele (em todos os aparelhos).
  if (mes < current) await markSummaryOpened(user.id, mes);

  const expenses = totalsByCategory(entries, "expense");
  const previousExpenses = totalsByCategory(previousEntries, "expense");
  const income = entries.filter((e) => e.kind === "income").reduce((s, e) => s + e.amountCents, 0);
  const expense = [...expenses.values()].reduce((s, v) => s + v, 0);
  const balance = income - expense;
  const closed = mes < current;
  const name = monthName(mes);
  const Name = name.charAt(0).toUpperCase() + name.slice(1);

  const comparisons = previousEntries.length
    ? [...new Set([...expenses.keys(), ...previousExpenses.keys()])]
        .map((id) => ({ id, diff: (expenses.get(id) ?? 0) - (previousExpenses.get(id) ?? 0) }))
        .filter((c) => Math.abs(c.diff) >= 1_000)
        .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
        .slice(0, 3)
        .map(
          (c) =>
            `Você gastou ${formatWholeMoney(Math.abs(c.diff))} a ${c.diff < 0 ? "menos" : "mais"} com ${findCategory(categories, c.id).name.toLocaleLowerCase("pt-BR")} do que em ${monthName(previous)}.`,
        )
    : [];

  const biggest = [...entries]
    .filter((e) => e.kind === "expense")
    .sort((a, b) => b.amountCents - a.amountCents)
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex flex-col gap-2">
        <p className="md-eyebrow">Resumo do mês</p>
        <h1 className="font-display text-display-lg text-tinta">{monthLongTitle(mes)}</h1>
        <p className="text-body text-tinta">
          {!closed
            ? `${Name} ainda está em andamento.`
            : balance >= 100
              ? `${Name} fechou no azul, com ${formatWholeMoney(balance)} de sobra.`
              : balance < 0
                ? `${Name} fechou com ${formatWholeMoney(-balance)} a menos. Quer ver onde dá para ajustar?`
                : `${Name} fechou zerado.`}
        </p>
      </div>
      <BalanceCard
        month={mes}
        isCurrentMonth={!closed}
        incomeCents={income}
        expenseCents={expense}
        plain
      />

      <CategoryDonut
        headingId="por-categoria"
        totals={expenses}
        categories={categories}
        month={mes}
      />

      {comparisons.length > 0 ? (
        <section
          aria-labelledby="comparacao"
          className="rounded-lg bg-superficie p-6 shadow-cartao"
        >
          <h2 id="comparacao" className="mb-3 font-display text-heading text-tinta">
            Comparado com {monthName(previous)}
          </h2>
          <ul className="flex list-disc flex-col gap-2 pl-6">
            {comparisons.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {biggest.length > 0 ? (
        <section aria-labelledby="maiores" className="rounded-lg bg-superficie p-4 shadow-cartao">
          <h2 id="maiores" className="px-2 pb-2 font-display text-heading text-tinta">
            Os maiores gastos
          </h2>
          <TransactionList
            entries={biggest}
            categories={categories}
            today={today}
            backTo={`/resumo/${mes}`}
          />
        </section>
      ) : null}

      <Link
        href={`/lancamentos?mes=${mes}` as Route}
        className={buttonClasses({ variant: "secondary" })}
      >
        Ver os lançamentos de {name}
      </Link>
    </div>
  );
}
