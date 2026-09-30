import type { Metadata } from "next";
import Link from "next/link";

import { Money } from "@/components/midas/money";
import { RecurringList } from "@/components/midas/recurring-list";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/dal";
import { loadContext } from "@/lib/data/overview";
import { listRecurring } from "@/lib/data/recurring";
import { monthOf } from "@/lib/dates";
import { isActiveIn } from "@/lib/finance/recurring";

export const metadata: Metadata = { title: "Rendas e gastos fixos" };

/** "O que entra e sai todo mês?" */
export default async function RecurringPage() {
  const user = await requireUser();
  const { today, categories } = await loadContext(user.id);
  const items = await listRecurring(user.id);
  const month = monthOf(today);
  const incomes = items.filter((r) => r.kind === "income");
  const expenses = items.filter((r) => r.kind === "expense");
  const sum = (list: typeof items) =>
    list.filter((r) => isActiveIn(r, month)).reduce((s, r) => s + r.amountCents, 0);

  return (
    <div className="mx-auto flex max-w-160 flex-col gap-6 pt-4">
      <h1 className="font-display text-display-lg text-tinta">Rendas e gastos fixos</h1>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Link href="/planejamento/fixos/novo" className={buttonClasses({ fullWidth: true })}>
          Adicionar gasto fixo
        </Link>
        <Link
          href="/planejamento/fixos/novo?tipo=renda"
          className={buttonClasses({ variant: "secondary", fullWidth: true })}
        >
          Adicionar renda fixa
        </Link>
      </div>
      {items.length === 0 ? (
        <EmptyState
          title={
            <>
              Nenhum fixo <em className="md-acento">ainda</em>.
            </>
          }
        >
          Aluguel, contas e salário entram sozinhos no dia marcado.
        </EmptyState>
      ) : (
        <>
          {[
            { title: "Rendas fixas", list: incomes, kind: "income" as const },
            { title: "Gastos fixos", list: expenses, kind: "expense" as const },
          ].map((group) =>
            group.list.length > 0 ? (
              <section
                key={group.kind}
                aria-labelledby={`fixos-${group.kind}`}
                className="rounded-lg bg-superficie p-4 shadow-cartao"
              >
                <div className="flex items-baseline justify-between gap-2 px-2 pb-2">
                  <h2 id={`fixos-${group.kind}`} className="font-display text-heading text-tinta">
                    {group.title}
                  </h2>
                  <span className="text-caption text-tinta-suave">
                    Este mês: <Money cents={sum(group.list)} kind={group.kind} />
                  </span>
                </div>
                <RecurringList items={group.list} categories={categories} today={today} />
              </section>
            ) : null,
          )}
        </>
      )}
    </div>
  );
}
