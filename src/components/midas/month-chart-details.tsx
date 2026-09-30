"use client";

import { Collapsible } from "radix-ui";
import { useId, useState } from "react";

import { cn } from "@/lib/cn";
import { monthAbbr } from "@/lib/dates";

import type { ChartMonth } from "./month-chart";

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
      <div className={cn("absolute inset-x-0 top-0 grid h-[200px]", cols)}>
        {months.map((m, i) => (
          <div key={m.month} className="relative">
            <button
              type="button"
              aria-label={`${m.label}: entrou ${m.income}, saiu ${m.expense}`}
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
                  "pointer-events-none absolute top-0 z-10 w-44 rounded-md border border-veio bg-superficie p-3 shadow-cartao",
                  i === 0
                    ? "left-0"
                    : i === months.length - 1
                      ? "right-0"
                      : "left-1/2 -translate-x-1/2",
                )}
              >
                <p className="text-label text-tinta">{m.label}</p>
                <p className="text-amount text-renda">Entrou + {m.income}</p>
                <p className="text-amount text-gasto">Saiu − {m.expense}</p>
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
                  <th scope="row" className="py-2 font-normal text-tinta">
                    {m.label}
                  </th>
                  <td className="py-2 text-right whitespace-nowrap text-renda tabular-nums">
                    {m.income}
                  </td>
                  <td className="py-2 text-right whitespace-nowrap text-gasto tabular-nums">
                    {m.expense}
                  </td>
                  <td className="py-2 text-right whitespace-nowrap text-tinta tabular-nums">
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
