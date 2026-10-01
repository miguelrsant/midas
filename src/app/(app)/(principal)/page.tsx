import type { Metadata, Route } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

import { Achievement, shouldShowAchievement } from "@/components/midas/achievement";
import { BalanceCard } from "@/components/midas/balance-card";
import { DiscreetToggle } from "@/components/midas/discreet-mode";
import { MonthChart } from "@/components/midas/month-chart";
import { MonthSwitcher } from "@/components/midas/month-switcher";
import { TransactionList } from "@/components/midas/transaction-list";
import { Button, buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import { requireUser } from "@/lib/auth/dal";
import { findCategory } from "@/lib/categories";
import { listEntries } from "@/lib/data/entries";
import { listLimits } from "@/lib/data/limits";
import { resolveMonth } from "@/lib/data/months";
import { loadContext, loadOverview } from "@/lib/data/overview";
import { lastSummaryOpened } from "@/lib/data/planning";
import { addMonths, monthName, monthOf, parseDate } from "@/lib/dates";
import { pickLimitNotice } from "@/lib/finance/limits";
import {
  assessMonth,
  chartSummary,
  chartTitle,
  monthLabel,
  projectionNote,
  summarySentence,
} from "@/lib/finance/phrases";
import { monthPoints } from "@/lib/finance/projection";
import { longDate, salutation } from "@/lib/greeting";
import { formatMoney, formatWholeMoney, roundToHundredReais } from "@/lib/money";

export const metadata: Metadata = { title: "Início" };

/** "Quanto sobrou este mês?" (docs/design-system/17-padroes-de-tela.md#painel-início) */
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const user = await requireUser();
  const now = new Date();
  const context = await loadContext(user.id);
  const { month, first, current, isCurrent } = resolveMonth((await searchParams).mes, {
    createdAt: user.createdAt,
    firstEntry: context.firstEntryDate,
  });
  const overview = await loadOverview(user.id, addMonths(month, -1));
  const { today, categories, projection, recurrings, expected } = overview;

  const firstAccess = !overview.firstEntryDate && recurrings.length === 0 && expected.length === 0;
  const greeting = (
    <div className="flex flex-col gap-2 pt-4 pb-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="md-eyebrow">{longDate(now)}</p>
        {!firstAccess ? <DiscreetToggle /> : null}
      </div>
      <GreetingTitle
        name={user.name}
        firstAccess={firstAccess}
        month={month}
        isCurrent={isCurrent}
        overview={overview}
      />
      <hr className="md-veio" aria-hidden="true" />
    </div>
  );

  if (firstAccess) {
    return (
      <div className="flex flex-col gap-6">
        {greeting}
        <EmptyState
          title={
            <>
              Tudo pronto para <em className="md-acento">começar</em>.
            </>
          }
          action={
            <div className="flex w-full flex-col gap-2 sm:w-auto">
              <Link href="/comecar" className={buttonClasses({ size: "lg", fullWidth: true })}>
                Adicionar minha renda
              </Link>
              <Link
                href="/lancamentos/novo"
                className={buttonClasses({ variant: "secondary", fullWidth: true })}
              >
                Anotar um gasto
              </Link>
            </div>
          }
        >
          Comece anotando quanto você recebe por mês. Assim o Midas mostra quanto sobra.
        </EmptyState>
      </div>
    );
  }

  const monthTotals = projection.totals.get(month) ?? { incomeCents: 0, expenseCents: 0 };
  const prev = addMonths(month, -1);
  const prevTotals = prev >= first ? projection.totals.get(prev) : undefined;
  const balance = monthTotals.incomeCents - monthTotals.expenseCents;
  const entries = (await listEntries(user.id, month, month)).slice(0, 5);

  // Um aviso só: limite perto do fim > projeção negativa.
  let notice: ReactNode = null;
  if (isCurrent) {
    const limits = await listLimits(user.id);
    const spent = new Map<string, number>();
    for (const e of overview.facts) {
      if (e.kind === "expense" && monthOf(e.date) === current) {
        spent.set(e.categoryId, (spent.get(e.categoryId) ?? 0) + e.amountCents);
      }
    }
    const limitPick = pickLimitNotice(
      [...limits.entries()].map(([categoryId, limitCents]) => ({
        categoryId,
        name: findCategory(categories, categoryId).name,
        spentCents: spent.get(categoryId) ?? 0,
        limitCents,
      })),
    );
    if (limitPick) {
      const { row, status, others } = limitPick;
      const more =
        others > 0
          ? ` E mais ${others} ${others === 1 ? "categoria" : "categorias"} perto do limite.`
          : "";
      const headline =
        status.state === "near"
          ? `${row.name} chegou a 90% do limite.`
          : status.state === "reached"
            ? `${row.name} chegou ao limite.`
            : `${row.name} passou do limite em ${formatMoney(status.overCents)}.`;
      const detail =
        status.state === "near"
          ? `Faltam ${formatMoney(status.remainingCents)} para o valor que você planejou em ${monthName(current)}.`
          : `Você planejou ${formatMoney(row.limitCents)} para ${monthName(current)}.`;
      notice = (
        <Notice tone="alerta" role="note">
          <strong>{headline}</strong> {detail}
          {more}{" "}
          <Link href="/planejamento/limites" className="md-link">
            Ver limites
          </Link>
        </Notice>
      );
    } else {
      const negative = projection.canWarnNegative
        ? [1, 2, 3]
            .map((i) => projection.future(addMonths(current, i)))
            .find((p) => p && p.incomeCents < p.expenseCents)
        : undefined;
      if (negative) {
        notice = (
          <Notice tone="alerta" role="note">
            <strong>{monthLabel(negative.month)} pode fechar no vermelho.</strong> Se os gastos
            seguirem como nos últimos meses, vão faltar cerca de{" "}
            {formatWholeMoney(roundToHundredReais(negative.expenseCents - negative.incomeCents))}.{" "}
            <Link href="/planejamento" className="md-link">
              Ver o planejamento
            </Link>
          </Notice>
        );
      }
    }
  }

  // Conquista: dias 1 a 7 do mês seguinte a um mês fechado no azul, até abrir o resumo.
  let achievement: ReactNode = null;
  if (isCurrent) {
    const closed = addMonths(current, -1);
    const closedTotals = projection.totals.get(closed);
    const closedBalance = closedTotals ? closedTotals.incomeCents - closedTotals.expenseCents : 0;
    const opened = await lastSummaryOpened(user.id);
    if (
      closedTotals &&
      shouldShowAchievement({
        closedMonthBalanceCents: closedBalance,
        todayDay: parseDate(today).day,
        summaryOpened: opened !== null && opened >= closed,
      })
    ) {
      const before = projection.totals.get(addMonths(closed, -1));
      const beforeBalance = before ? before.incomeCents - before.expenseCents : null;
      const sentence =
        beforeBalance !== null && closedBalance > beforeBalance
          ? `Sobraram ${formatWholeMoney(closedBalance - beforeBalance)} a mais que em ${monthName(addMonths(closed, -1))}.`
          : "Quer separar uma parte para as férias?";
      achievement = <Achievement month={closed} savedCents={closedBalance} sentence={sentence} />;
    }
  }

  // O gráfico começa no mês atual e mostra a projeção dos 5 seguintes.
  const chartMonths = [0, 1, 2, 3, 4, 5].map((i) => addMonths(current, i));
  const points = monthPoints(projection, chartMonths, today);
  const showChart = points.some((p) => p.incomeCents + p.expenseCents > 0);
  const here = isCurrent ? "/" : `/?mes=${month}`;

  return (
    <div className="flex flex-col gap-6">
      {greeting}
      <p className="-mt-4 text-body text-tinta">
        {summarySentence(
          balance,
          prevTotals ? prevTotals.incomeCents - prevTotals.expenseCents : null,
          month,
          isCurrent,
        )}
      </p>
      <MonthSwitcher month={month} first={first} last={current} basePath="/" />
      {notice}
      {achievement}
      <BalanceCard
        month={month}
        isCurrentMonth={isCurrent}
        incomeCents={monthTotals.incomeCents}
        expenseCents={monthTotals.expenseCents}
        plain={Boolean(achievement)}
      />
      <div className="flex flex-col gap-2">
        <Button asChild size="lg" fullWidth>
          <Link
            href={
              `/lancamentos/novo?de=${encodeURIComponent(here)}${isCurrent ? "" : `&mes=${month}`}` as Route
            }
          >
            Adicionar gasto
          </Link>
        </Button>
        <Button asChild variant="secondary" fullWidth>
          <Link
            href={
              `/lancamentos/novo?tipo=renda&de=${encodeURIComponent(here)}${isCurrent ? "" : `&mes=${month}`}` as Route
            }
          >
            Adicionar renda
          </Link>
        </Button>
      </div>

      <section aria-labelledby="ultimos" className="rounded-lg bg-superficie p-4 shadow-cartao">
        <div className="flex items-center justify-between gap-2 px-2 pb-2">
          <h2 id="ultimos" className="md-eyebrow">
            Últimos lançamentos
          </h2>
          <Link
            href={(isCurrent ? "/lancamentos" : `/lancamentos?mes=${month}`) as Route}
            className={buttonClasses({ variant: "ghost" })}
          >
            Ver todos
          </Link>
        </div>
        {entries.length > 0 ? (
          <TransactionList entries={entries} categories={categories} today={today} />
        ) : (
          <div className="flex flex-col items-center gap-2 px-2 py-6 text-center">
            <p className="font-display text-heading text-tinta">
              {isCurrent ? (
                <>
                  {monthLabel(month)} começa <em className="md-acento">aqui</em>.
                </>
              ) : (
                `${monthLabel(month)} ficou em branco.`
              )}
            </p>
            <p className="max-w-[34ch] text-tinta-suave">
              {isCurrent
                ? "Anote o primeiro gasto do mês e o Midas passa a mostrar para onde vai o seu dinheiro."
                : `Se lembrar de algum gasto ou renda de ${monthName(month)}, anote e o gráfico do ano fica completo.`}
            </p>
          </div>
        )}
      </section>

      {showChart ? (
        <MonthChart
          headingId="grafico-inicio"
          points={points}
          title={chartTitle(points, { canWarnNegative: projection.canWarnNegative })}
          summary={chartSummary(points)}
          note={projectionNote(projection.reference, {
            hasFixed: recurrings.length > 0,
            hasExpected: overview.expected.length > 0,
            fixedIncomeOnly: projection.hasFixedIncome && projection.averageVariableIncome > 0,
          })}
        />
      ) : (
        <section className="rounded-lg bg-superficie p-6 shadow-cartao">
          <p className="md-eyebrow">Renda x gastos</p>
          <p className="mt-2 text-tinta-suave">
            O gráfico aparece quando você anotar uma renda fixa ou fechar o primeiro mês com
            lançamentos.
          </p>
        </section>
      )}
    </div>
  );
}

function GreetingTitle({
  name,
  firstAccess,
  month,
  isCurrent,
  overview,
}: {
  name: string;
  firstAccess: boolean;
  month: string;
  isCurrent: boolean;
  overview: Awaited<ReturnType<typeof loadOverview>>;
}) {
  const hello = `${salutation()}, ${name}.`;
  if (firstAccess) return <h1 className="font-display text-display-lg text-tinta">{hello}</h1>;
  const totals = overview.projection.totals.get(month);
  const estimate = isCurrent
    ? overview.projection.currentEstimate
    : totals
      ? { incomeCents: totals.incomeCents, expenseCents: totals.expenseCents }
      : null;
  const assessment = assessMonth(month, totals || isCurrent ? estimate : null, isCurrent);
  return (
    <h1 className="font-display text-display-lg text-tinta">
      {hello}{" "}
      {assessment.accent ? (
        <>
          {assessment.text}
          <em className="md-acento">{assessment.accent}</em>.
        </>
      ) : (
        assessment.text
      )}
    </h1>
  );
}
