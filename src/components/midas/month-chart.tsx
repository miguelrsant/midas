import type { MonthKey } from "@/lib/dates";
import { niceTicks } from "@/lib/finance/chart";
import { monthLabel } from "@/lib/finance/phrases";
import type { MonthPoint } from "@/lib/finance/projection";
import { formatAxis, formatMoney, roundToHundredReais } from "@/lib/money";

import { MonthChartDetails } from "./month-chart-details";

/**
 * Gráfico renda x gastos por mês (docs/design-system/componentes/income-expense-chart.md),
 * em SVG próprio, desenhado no servidor. Posições são atributos do SVG ou classes prontas
 * (bottom-[N%], grid-cols-N): nada de style="" (a CSP bloqueia).
 */

const HEIGHT = 200;
const COL = 100;

export interface ChartMonth {
  month: MonthKey;
  label: string;
  income: string;
  expense: string;
  balance: string;
  projected: boolean;
}

function valueText(cents: number, projected: boolean) {
  return formatMoney(projected ? roundToHundredReais(cents) : cents, { sign: "never" });
}

export function MonthChart({
  points,
  title,
  summary,
  note,
  eyebrow = "Renda x gastos",
  headingId,
}: {
  points: readonly MonthPoint[];
  title: string;
  summary: string;
  note?: string;
  eyebrow?: string;
  headingId: string;
}) {
  const max = Math.max(0, ...points.flatMap((p) => [p.incomeCents, p.expenseCents]));
  const ticks = niceTicks(max);
  const top = ticks.at(-1)!;
  const width = COL * points.length;
  const y = (cents: number) => HEIGHT - (cents / top) * HEIGHT;
  const firstProjected = points.findIndex((p) => p.projected);
  const hasThirteenth = points.some((p) => p.projected && p.hasThirteenth);

  const months: ChartMonth[] = points.map((p) => {
    const suffix = p.projected ? " (projeção)" : p.current ? " (até agora)" : "";
    const balance = p.incomeCents - p.expenseCents;
    return {
      month: p.month,
      label: `${monthLabel(p.month)}${suffix}`,
      income: valueText(p.incomeCents, p.projected),
      expense: valueText(p.expenseCents, p.projected),
      balance: `${balance < 0 ? "Faltou" : "Sobrou"} ${valueText(Math.abs(balance), p.projected)}`,
      projected: p.projected,
    };
  });

  return (
    <section aria-labelledby={headingId} className="rounded-lg bg-superficie p-6 shadow-cartao">
      <p className="md-eyebrow">{eyebrow}</p>
      <h2 id={headingId} className="mt-1 mb-3 font-display text-heading text-tinta">
        {title}
      </h2>

      <div className="flex gap-2">
        {/* Eixo de valores (HTML, para o texto não esticar com o SVG). */}
        <div
          aria-hidden="true"
          className="md-grafico-eixo relative h-[200px] w-11 flex-none text-caption text-tinta-suave"
        >
          {ticks.map((t) => (
            <span
              key={t}
              className={`absolute right-0 translate-y-1/2 ${`bottom-[${Math.round((t / top) * 100)}%]`}`}
            >
              {formatAxis(t)}
            </span>
          ))}
        </div>

        <div className="relative min-w-0 flex-1">
          <svg
            role="img"
            aria-label={summary}
            viewBox={`0 0 ${width} ${HEIGHT}`}
            preserveAspectRatio="none"
            className="block h-[200px] w-full overflow-visible"
          >
            {ticks.map((t) => (
              <line
                key={t}
                x1={0}
                x2={width}
                y1={y(t)}
                y2={y(t)}
                stroke="var(--veio)"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {points.map((p, i) => {
              const x = i * COL;
              const bars = [
                {
                  cents: p.incomeCents,
                  x: x + 18,
                  color: "var(--grafico-renda)",
                  fill: "var(--renda-fundo)",
                },
                {
                  cents: p.expenseCents,
                  x: x + 52,
                  color: "var(--grafico-gasto)",
                  fill: "var(--gasto-fundo)",
                },
              ];
              return bars.map((b, j) =>
                b.cents > 0 ? (
                  <rect
                    key={`${p.month}-${j}`}
                    x={b.x}
                    y={y(b.cents)}
                    width={30}
                    height={HEIGHT - y(b.cents)}
                    fill={p.projected ? b.fill : b.color}
                    stroke={p.projected ? b.color : "none"}
                    strokeWidth={p.projected ? 1.5 : 0}
                    strokeDasharray={p.projected ? "4 3" : undefined}
                    vectorEffect="non-scaling-stroke"
                  />
                ) : null,
              );
            })}
            {firstProjected > 0 ? (
              <line
                x1={firstProjected * COL}
                x2={firstProjected * COL}
                y1={0}
                y2={HEIGHT}
                stroke="var(--grafico-projecao)"
                strokeWidth={2}
                strokeDasharray="5 4"
                vectorEffect="non-scaling-stroke"
              />
            ) : null}
          </svg>
          <MonthChartDetails months={months} firstProjected={firstProjected} />
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-caption text-tinta-suave">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-3 rounded-[3px] bg-grafico-renda" />
          Renda
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-3 rounded-[3px] bg-grafico-gasto" />
          Gastos
        </span>
        {firstProjected >= 0 ? (
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="size-3 rounded-[3px] border border-dashed border-ouro-texto"
            />
            Projeção{hasThirteenth ? " (inclui 13º)" : ""}
          </span>
        ) : null}
      </div>
      {note ? <p className="mt-2 text-caption text-tinta-suave">{note}</p> : null}
    </section>
  );
}
