import type { MonthKey } from "@/lib/dates";
import { niceTicks } from "@/lib/finance/chart";
import { monthLabel } from "@/lib/finance/phrases";
import type { Layers, MonthPoint } from "@/lib/finance/projection";
import { formatAxis, formatMoney, roundToHundredReais } from "@/lib/money";

import { MonthChartDetails } from "./month-chart-details";

/**
 * Gráfico renda x gastos por mês (docs/design-system/componentes/income-expense-chart.md),
 * em SVG próprio, desenhado no servidor. Posições são atributos do SVG ou classes prontas
 * (bottom-[N%], grid-cols-N): nada de style="" (a CSP bloqueia).
 *
 * Cada barra empilha duas camadas da mesma cor: a fixa embaixo (cheia) e a variável em
 * cima (hachurada). No mês atual, o que ainda deve entrar ou sair fica por cima, no
 * estilo de projeção. A hachura é horizontal porque o SVG estica só na largura.
 */

const HEIGHT = 200;
const COL = 100;

export interface ChartSide {
  /** Real até agora (mês atual) ou total (outros meses). */
  total: string;
  /** "fixa R$ 5.400 · variável R$ 800", sem as partes zeradas. */
  split: string | null;
  /** Mês atual: "R$ 300" que ainda deve entrar ou sair. */
  pending: string | null;
}

export interface ChartMonth {
  month: MonthKey;
  label: string;
  income: ChartSide;
  expense: ChartSide;
  balance: string;
  projected: boolean;
}

function valueText(cents: number, rounded: boolean) {
  return formatMoney(rounded ? roundToHundredReais(cents) : cents, { sign: "never" });
}

function side(l: Layers, projected: boolean): ChartSide {
  const parts = [
    l.fixedCents > 0 ? `fixa ${valueText(l.fixedCents, projected)}` : null,
    l.variableCents > 0 ? `variável ${valueText(l.variableCents, projected)}` : null,
  ].filter(Boolean);
  return {
    total: valueText(l.fixedCents + l.variableCents, projected),
    split: parts.length > 0 ? parts.join(" · ") : null,
    pending: l.pendingCents > 0 ? valueText(l.pendingCents, true) : null,
  };
}

interface Segment {
  key: string;
  from: number;
  cents: number;
  style: "solid" | "hatched" | "projected" | "projected-hatched";
}

/** As camadas de uma barra, de baixo para cima, sem as zeradas. */
function segments(l: Layers, projected: boolean): Segment[] {
  const list: Segment[] = [];
  let from = 0;
  const push = (key: string, cents: number, style: Segment["style"]) => {
    if (cents <= 0) return;
    list.push({ key, from, cents, style });
    from += cents;
  };
  push("fixa", l.fixedCents, projected ? "projected" : "solid");
  push("variavel", l.variableCents, projected ? "projected-hatched" : "hatched");
  push("falta", l.pendingCents, "projected");
  return list;
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
  const hasThirteenth = points.some((p) => (p.projected || p.current) && p.hasThirteenth);
  const hasEstimate =
    firstProjected >= 0 || points.some((p) => p.income.pendingCents + p.expense.pendingCents > 0);

  const months: ChartMonth[] = points.map((p) => {
    const suffix = p.projected ? " (projeção)" : p.current ? " (até agora)" : "";
    const real = (l: Layers) => l.fixedCents + l.variableCents;
    const balance = real(p.income) - real(p.expense);
    return {
      month: p.month,
      label: `${monthLabel(p.month)}${suffix}`,
      income: side(p.income, p.projected),
      expense: side(p.expense, p.projected),
      balance: `${balance < 0 ? "Faltou" : "Sobrou"} ${valueText(Math.abs(balance), p.projected)}`,
      projected: p.projected,
    };
  });
  const hatch = { renda: `${headingId}-hachura-renda`, gasto: `${headingId}-hachura-gasto` };

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
            <defs>
              {(["renda", "gasto"] as const).map((k) => (
                <pattern key={k} id={hatch[k]} patternUnits="userSpaceOnUse" width={4} height={4}>
                  <rect x={0} y={0} width={4} height={1.5} fill={`var(--grafico-${k})`} />
                </pattern>
              ))}
            </defs>
            {points.map((p, i) => {
              const x = i * COL;
              const bars = [
                { layers: p.income, x: x + 18, k: "renda" as const },
                { layers: p.expense, x: x + 52, k: "gasto" as const },
              ];
              return bars.flatMap((b) => {
                const color = `var(--grafico-${b.k})`;
                const light = `var(--${b.k}-fundo)`;
                return segments(b.layers, p.projected).map((seg) => {
                  const top = y(seg.from + seg.cents);
                  const height = y(seg.from) - top;
                  const dashed = seg.style === "projected" || seg.style === "projected-hatched";
                  const hatched = seg.style === "hatched" || seg.style === "projected-hatched";
                  return (
                    <g key={`${p.month}-${b.k}-${seg.key}`}>
                      <rect
                        x={b.x}
                        y={top}
                        width={30}
                        height={height}
                        fill={seg.style === "solid" ? color : light}
                        stroke={seg.style === "solid" ? "none" : color}
                        strokeWidth={dashed ? 1.5 : 1}
                        strokeDasharray={dashed ? "4 3" : undefined}
                        vectorEffect="non-scaling-stroke"
                      />
                      {hatched ? (
                        <rect
                          x={b.x}
                          y={top}
                          width={30}
                          height={height}
                          fill={`url(#${hatch[b.k]})`}
                          opacity={dashed ? 0.5 : 1}
                        />
                      ) : null}
                    </g>
                  );
                });
              });
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
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-3 rounded-[3px] bg-tinta-suave" />
          Fixa
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="md-hachura size-3 rounded-[3px] text-tinta-suave" />
          Variável
        </span>
        {hasEstimate ? (
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
