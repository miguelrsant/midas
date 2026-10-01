"use client";

import { Collapsible } from "radix-ui";
import { useId, useState } from "react";

import { cn } from "@/lib/cn";
import { monthAbbr } from "@/lib/dates";

import type { ChartMonth, ChartSide } from "./month-chart";

/** "entrou R$ 6.200 (fixa R$ 5.400 · variável R$ 800); deve entrar mais R$ 300" */
function spoken(verb: "entrou" | "saiu", s: ChartSide) {
  const more = verb === "entrou" ? "deve entrar mais" : "deve sair mais";
  return `${verb} ${s.total}${s.split ? ` (${s.split})` : ""}${s.pending ? `; ${more} ${s.pending}` : ""}`;
}

function Breakdown({ s, verb }: { s: ChartSide; verb: "entrar" | "sair" }) {
  return (
    <>
      {s.split ? <span className="block text-caption text-tinta-suave">{s.split}</span> : null}
      {s.pending ? (
        <span className="block text-caption text-tinta-suave">
          deve {verb} mais {s.pending}
        </span>
      ) : null}
    </>
  );
}

/**
 * Parte interativa do gráfico: um botão transparente por mês abre o balão (foco, toque
 * ou mouse), os rótulos dos meses e a tabela "Ver em tabela".
 */
export function MonthChartDetails({
  months,
  firstProjected,
}: {
  months: ChartMonth[];
  firstProjected: number;
}) {
  const [active, setActive] = useState<number | null>(null);
  const tableId = useId();
  const cols = `grid-cols-${Math.min(12, Math.max(1, months.length))}`;
  return (
    <>
      {/* Com 12 meses, as colunas ficam estreitas demais para tocar no celular (WCAG 2.5.8):
          lá, a tabela "Ver em tabela" é o caminho; o balão aparece a partir de 640px. */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-[200px]",
          months.length > 6 ? "hidden sm:grid" : "grid",
          cols,
        )}
      >
        {months.map((m, i) => (
          <div key={m.month} className="relative">
            <button
              type="button"
              aria-label={`${m.label}: ${spoken("entrou", m.income)}; ${spoken("saiu", m.expense)}`}
              aria-expanded={active === i}
              className={cn(
                "absolute inset-0 rounded-sm focus-visible:outline-2 focus-visible:outline-foco",
                active === i && "bg-superficie-funda/60",
              )}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onClick={() => setActive(active === i ? null : i)}
            />
            {active === i ? (
              <div
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute top-0 z-10 w-56 rounded-md border border-veio bg-superficie p-3 shadow-cartao",
                  i === 0
                    ? "left-0"
                    : i === months.length - 1
                      ? "right-0"
                      : "left-1/2 -translate-x-1/2",
                )}
              >
                <p className="text-label text-tinta">{m.label}</p>
                <p className="text-amount text-renda">Entrou + {m.income.total}</p>
                <Breakdown s={m.income} verb="entrar" />
                <p className="mt-1 text-amount text-gasto">Saiu − {m.expense.total}</p>
                <Breakdown s={m.expense} verb="sair" />
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <div
        aria-hidden="true"
        className={cn("md-grafico-eixo mt-1 grid text-center text-caption text-tinta-suave", cols)}
      >
        {months.map((m, i) => (
          <span
            key={m.month}
            className={cn(i === firstProjected && "font-semibold text-ouro-texto")}
          >
            {monthAbbr(m.month)}
          </span>
        ))}
      </div>
      <Collapsible.Root className="mt-3">
        <Collapsible.Trigger
          aria-controls={tableId}
          className="inline-flex min-h-11 items-center rounded-md px-3 text-label text-ouro-texto hover:bg-superficie-funda focus-visible:outline-2 focus-visible:outline-foco data-[state=closed]:[&>.aberto]:hidden data-[state=open]:[&>.fechado]:hidden"
        >
          <span className="fechado">Ver em tabela</span>
          <span className="aberto">Esconder tabela</span>
        </Collapsible.Trigger>
        <Collapsible.Content id={tableId}>
          <table className="mt-2 w-full text-left text-caption">
            <caption className="md-sr">Renda e gastos por mês</caption>
            <thead>
              <tr className="border-b border-veio text-tinta-suave">
                <th scope="col" className="py-2 font-semibold">
                  Mês
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Entrou
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Saiu
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Resultado
                </th>
              </tr>
            </thead>
            <tbody>
              {months.map((m) => (
                <tr key={m.month} className="border-b border-veio last:border-b-0">
                  <th scope="row" className="py-2 align-top font-normal text-tinta">
                    {m.label}
                  </th>
                  <td className="py-2 text-right align-top tabular-nums">
                    <span className="block whitespace-nowrap text-renda">{m.income.total}</span>
                    <Breakdown s={m.income} verb="entrar" />
                  </td>
                  <td className="py-2 text-right align-top tabular-nums">
                    <span className="block whitespace-nowrap text-gasto">{m.expense.total}</span>
                    <Breakdown s={m.expense} verb="sair" />
                  </td>
                  <td className="py-2 text-right align-top whitespace-nowrap text-tinta tabular-nums">
                    {m.balance}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Collapsible.Content>
      </Collapsible.Root>
    </>
  );
}
