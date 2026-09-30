import type { Metadata } from "next";
import Link from "next/link";

import { LimitList } from "@/components/midas/limit-list";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/dal";
import { entryFacts } from "@/lib/data/entries";
import { listLimits } from "@/lib/data/limits";
import { loadContext } from "@/lib/data/overview";
import { monthOf } from "@/lib/dates";

export const metadata: Metadata = { title: "Limites por categoria" };

/** "Quanto quero gastar com cada coisa?" */
export default async function LimitsPage() {
  const user = await requireUser();
  const { today, categories } = await loadContext(user.id);
  const month = monthOf(today);
  const [limits, facts] = await Promise.all([
    listLimits(user.id),
    entryFacts(user.id, month, month),
  ]);
  const spent = new Map<string, number>();
  for (const f of facts)
    if (f.kind === "expense")
      spent.set(f.categoryId, (spent.get(f.categoryId) ?? 0) + f.amountCents);

  return (
    <div className="mx-auto flex max-w-160 flex-col gap-6 pt-4">
      <h1 className="font-display text-display-lg text-tinta">Limites por categoria</h1>
      <Link href="/planejamento/limites/novo" className={buttonClasses({ fullWidth: true })}>
        Definir um limite
      </Link>
      {limits.size === 0 ? (
        <EmptyState
          title={
            <>
              Nenhum limite <em className="md-acento">ainda</em>.
            </>
          }
        >
          Escolha uma categoria e o Midas avisa quando o gasto chegar a 90%.
        </EmptyState>
      ) : (
        <section className="rounded-lg bg-superficie p-4 shadow-cartao">
          <LimitList limits={limits} spent={spent} categories={categories} month={month} />
        </section>
      )}
    </div>
  );
}
