import type { Metadata, Route } from "next";
import Link from "next/link";

import { ExpectedIncomeRow } from "@/components/midas/expected-income-row";
import { LimitList } from "@/components/midas/limit-list";
import { MonthChart } from "@/components/midas/month-chart";
import { RecurringList } from "@/components/midas/recurring-list";
import { buttonClasses } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/dal";
import { findCategory } from "@/lib/categories";
import { listLimits } from "@/lib/data/limits";
import { loadOverview } from "@/lib/data/overview";
import { addMonths, makeMonth, monthOf, parseMonth, todayInSaoPaulo } from "@/lib/dates";
import { chartSummary, monthLabel, projectionNote } from "@/lib/finance/phrases";
import { monthPoints } from "@/lib/finance/projection";
import { paymentLabel } from "@/lib/labor/types";
import { formatWholeMoney, roundToHundredReais } from "@/lib/money";

export const metadata: Metadata = { title: "Planejamento" };

/** "Como vão ficar os próximos meses?" (docs/design-system/17-padroes-de-tela.md#planejamento) */
export default async function PlanningPage({
  searchParams,
}: {
  searchParams: Promise<{ ano?: string }>;
}) {
  const user = await requireUser();
  const current0 = monthOf(todayInSaoPaulo());
  const requested = Number((await searchParams).ano);
  const currentYear = parseMonth(current0).year;
  const lastYear = parseMonth(addMonths(current0, 12)).year;
  const year =
    Number.isInteger(requested) && requested >= currentYear - 5 && requested <= lastYear
      ? requested
      : currentYear;

  const overview = await loadOverview(user.id, makeMonth(year, 1));
  const { today, categories, projection, recurrings, expected } = overview;
  const current = monthOf(today);
  const horizon = addMonths(current, 12);
  const months = Array.from({ length: 12 }, (_, i) => makeMonth(year, i + 1)).filter(
    (m) => m <= horizon,
  );
  const points = monthPoints(projection, months, today);

  const negative = points.find((p) => p.projected && p.incomeCents < p.expenseCents);
  const yearBalance = points.reduce((s, p) => s + p.incomeCents - p.expenseCents, 0);
  const hasProjection = points.some((p) => p.projected);
  const title = negative
    ? `${monthLabel(negative.month)} pode fechar no vermelho.`
    : hasProjection
      ? `${year} deve fechar com ${formatWholeMoney(roundToHundredReais(Math.max(0, yearBalance)))} de sobra.`
      : `${year}: ${yearBalance >= 0 ? `${formatWholeMoney(yearBalance)} de sobra até agora` : `${formatWholeMoney(-yearBalance)} a menos até agora`}.`;

  const limits = await listLimits(user.id);
  const spent = new Map<string, number>();
  for (const f of overview.facts) {
    if (f.kind === "expense" && monthOf(f.date) === current)
      spent.set(f.categoryId, (spent.get(f.categoryId) ?? 0) + f.amountCents);
  }
  const note = hasProjection
    ? projectionNote(projection.reference, {
        hasFixed: recurrings.length > 0,
        hasExpected: expected.length > 0,
        fixedIncomeOnly: projection.hasFixedIncome && projection.averageVariableIncome > 0,
      })
    : projection.reference.length === 0
      ? "A projeção aparece quando você fechar o primeiro mês com lançamentos."
      : undefined;

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex flex-col gap-2">
        <p className="md-eyebrow">Planejamento</p>
        <h1 className="font-display text-display-lg text-tinta">{title}</h1>
        <nav aria-label="Ano" className="flex gap-2">
          {year > currentYear - 1 ? (
            <Link
              href={`/planejamento?ano=${year - 1}` as Route}
              className={buttonClasses({ variant: "ghost" })}
            >
              Ver {year - 1}
            </Link>
          ) : null}
          {year < lastYear ? (
            <Link
              href={`/planejamento?ano=${year + 1}` as Route}
              className={buttonClasses({ variant: "ghost" })}
            >
              Ver {year + 1}
            </Link>
          ) : null}
        </nav>
      </div>

      {points.length > 0 ? (
        <MonthChart
          headingId="grafico-ano"
          eyebrow={`Mês a mês em ${year}`}
          points={points}
          title={title}
          summary={chartSummary(points)}
          note={note}
        />
      ) : null}

      <section aria-labelledby="previstas" className="rounded-lg bg-superficie p-4 shadow-cartao">
        <h2 id="previstas" className="px-2 pb-2 font-display text-heading text-tinta">
          Rendas previstas
        </h2>
        {expected.length > 0 ? (
          <ul className="flex flex-col">
            {expected.map((e) => (
              <ExpectedIncomeRow
                key={e.id}
                item={e}
                label={paymentLabel(e.labelKey)}
                icon={findCategory(categories, e.categoryId).icon}
                today={today}
              />
            ))}
          </ul>
        ) : (
          <p className="px-2 text-tinta-suave">
            As calculadoras de 13º, férias, rescisão e seguro-desemprego colocam aqui o que vai
            entrar.{" "}
            <Link href="/calculadoras" className="md-link">
              Ir para as calculadoras
            </Link>
          </p>
        )}
      </section>

      <section aria-labelledby="fixos" className="rounded-lg bg-superficie p-4 shadow-cartao">
        <div className="flex items-center justify-between gap-2 px-2 pb-2">
          <h2 id="fixos" className="font-display text-heading text-tinta">
            Fixos
          </h2>
          <Link href="/planejamento/fixos" className={buttonClasses({ variant: "ghost" })}>
            Ver todos os fixos
          </Link>
        </div>
        {recurrings.length > 0 ? (
          <RecurringList items={recurrings.slice(0, 6)} categories={categories} today={today} />
        ) : (
          <p className="px-2 text-tinta-suave">
            Aluguel, contas e salário entram sozinhos no dia marcado.
          </p>
        )}
        <div className="mt-3 flex flex-col gap-2 px-2 sm:flex-row">
          <Link
            href="/planejamento/fixos/novo?tipo=renda"
            className={buttonClasses({ variant: "secondary" })}
          >
            Adicionar renda fixa
          </Link>
          <Link href="/planejamento/fixos/novo" className={buttonClasses({ variant: "secondary" })}>
            Adicionar gasto fixo
          </Link>
        </div>
      </section>

      <section aria-labelledby="limites" className="rounded-lg bg-superficie p-4 shadow-cartao">
        <div className="flex items-center justify-between gap-2 px-2 pb-2">
          <h2 id="limites" className="font-display text-heading text-tinta">
            Limites por categoria
          </h2>
          <Link href="/planejamento/limites" className={buttonClasses({ variant: "ghost" })}>
            Ver limites
          </Link>
        </div>
        {limits.size > 0 ? (
          <LimitList limits={limits} spent={spent} categories={categories} month={current} />
        ) : (
          <p className="px-2 text-tinta-suave">
            Escolha uma categoria e o Midas avisa quando o gasto chegar a 90%.
          </p>
        )}
        <div className="mt-3 px-2">
          <Link
            href="/planejamento/limites/novo"
            className={buttonClasses({ variant: "secondary" })}
          >
            Definir um limite
          </Link>
        </div>
      </section>
    </div>
  );
}
