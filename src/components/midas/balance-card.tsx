import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/cn";
import { type MonthKey, monthName } from "@/lib/dates";
import { balanceSentence } from "@/lib/finance/phrases";
import { floorPercent, formatMoney } from "@/lib/money";

import { Bar } from "./bar";
import { Money } from "./money";

/** Cartão de saldo do mês (docs/design-system/componentes/balance-card.md). */
export function BalanceCard({
  month,
  isCurrentMonth,
  incomeCents,
  expenseCents,
  plain = false,
}: {
  month: MonthKey;
  isCurrentMonth: boolean;
  incomeCents: number;
  expenseCents: number;
  plain?: boolean;
}) {
  const balance = incomeCents - expenseCents;
  const negative = balance < 0;
  const big = Math.abs(balance) >= 10_000_000;
  const pct = incomeCents > 0 ? floorPercent(expenseCents, incomeCents) : null;
  return (
    <section
      aria-labelledby="saldo-titulo"
      className={cn(
        "@container rounded-lg p-6 shadow-cartao",
        plain ? "bg-superficie" : "md-marmore",
      )}
    >
      <h2 id="saldo-titulo" className="md-eyebrow">
        {negative ? "Faltou" : "Sobrou"} em {monthName(month)}
        {isCurrentMonth ? " até agora" : ""}
      </h2>
      <p
        className={cn(
          "mt-2 mb-6 font-classica font-bold whitespace-nowrap lining-nums tabular-nums",
          big ? "text-display-lg @[360px]:text-display-xl" : "text-display-xl",
          negative ? "text-gasto" : "text-tinta",
        )}
      >
        <span className="md-valor">
          {negative ? <span className="md-sr">Faltou </span> : null}
          {negative ? <span aria-hidden="true">−&nbsp;</span> : null}
          {formatMoney(Math.abs(balance), { sign: "never" })}
        </span>
        <span className="md-oculto">
          <span aria-hidden="true">R$&nbsp;•••••</span>
          <span className="md-sr">valor oculto</span>
        </span>
      </p>
      <dl className="grid grid-cols-1 gap-2 border-t border-veio pt-4 @[340px]:grid-cols-2 @[340px]:gap-4">
        <div className="flex items-center justify-between gap-2 @[340px]:block">
          <dt className="flex items-center gap-1 text-caption text-tinta-suave">
            <ArrowDownLeft aria-hidden="true" className="size-5" strokeWidth={1.75} />
            Entrou
          </dt>
          <dd className="font-mono text-[1.1875rem]/[1.625rem] font-medium">
            <Money cents={incomeCents} kind="income" />
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2 @[340px]:block">
          <dt className="flex items-center gap-1 text-caption text-tinta-suave">
            <ArrowUpRight aria-hidden="true" className="size-5" strokeWidth={1.75} />
            Saiu
          </dt>
          <dd className="font-mono text-[1.1875rem]/[1.625rem] font-medium">
            <Money cents={expenseCents} kind="expense" />
          </dd>
        </div>
      </dl>
      {pct !== null ? <Bar percent={pct} className="mt-4" /> : null}
      <p className="mt-2 text-caption text-tinta-suave">
        {balanceSentence(incomeCents, expenseCents, month, isCurrentMonth)}
      </p>
    </section>
  );
}
