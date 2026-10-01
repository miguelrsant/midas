import type { ReactNode } from "react";

import { type Category, findCategory } from "@/lib/categories";
import { type MonthKey, monthName } from "@/lib/dates";
import { donutArcs, type Slice, topSlices } from "@/lib/finance/breakdown";
import { floorPercent, formatWholeMoney } from "@/lib/money";

import { CategoryIcon } from "./category-icon";
import { Money } from "./money";
import { TableToggle } from "./table-toggle";

/**
 * Rosca de gastos por categoria (docs/design-system/componentes/category-donut.md): até
 * seis fatias, com a legenda (ícone, nome, valor e %) ao lado e "Ver em tabela".
 * Desenhada no servidor; arcos por `stroke-dasharray` em atributo (a CSP bloqueia style="").
 * A cor vai pela posição da fatia, não pela categoria.
 */

// Classes inteiras, para o Tailwind encontrar.
const SWATCH = [
  "bg-grafico-cat-1",
  "bg-grafico-cat-2",
  "bg-grafico-cat-3",
  "bg-grafico-cat-4",
  "bg-grafico-cat-5",
] as const;
const STROKE = [1, 2, 3, 4, 5].map((n) => `var(--grafico-cat-${n})`);
const OTHER_SWATCH = "bg-grafico-cat-outros";
const OTHER_STROKE = "var(--grafico-cat-outros)";

/** r = 100 / 2π: o perímetro do círculo é 100, e os arcos ficam em porcentagem. */
const R = 15.9155;

function sliceName(slice: Slice, categories: readonly Category[]) {
  return slice.other ? "Outros" : findCategory(categories, slice.key).name;
}

/** "Mercado levou a maior parte de outubro: R$ 1.230." */
export function donutTitle(
  slices: readonly Slice[],
  categories: readonly Category[],
  month: MonthKey,
) {
  const first = slices[0];
  if (!first) return `Nenhum gasto anotado em ${monthName(month)}.`;
  return `${sliceName(first, categories)} levou a maior parte de ${monthName(month)}: ${formatWholeMoney(first.cents)}.`;
}

export function CategoryDonut({
  totals,
  categories,
  month,
  headingId,
  footer,
}: {
  totals: ReadonlyMap<string, number>;
  categories: readonly Category[];
  month: MonthKey;
  headingId: string;
  footer?: ReactNode;
}) {
  const slices = topSlices(totals);
  const arcs = donutArcs(slices, 0.6);
  const sum = slices.reduce((s, x) => s + x.cents, 0);
  const named = slices.map((s) => ({ slice: s, name: sliceName(s, categories) }));
  const summary =
    slices.length === 0
      ? `Nenhum gasto em ${monthName(month)}.`
      : `Gráfico de rosca dos gastos de ${monthName(month)} por categoria: ${named
          .map(({ slice, name }) => `${name} ${slice.percent}%`)
          .join(", ")}.`;

  return (
    <section aria-labelledby={headingId} className="rounded-lg bg-superficie p-6 shadow-cartao">
      <p className="md-eyebrow">Gastos por categoria</p>
      <h2 id={headingId} className="mt-1 mb-4 font-display text-heading text-tinta">
        {donutTitle(slices, categories, month)}
      </h2>

      {slices.length > 0 ? (
        <>
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="relative size-44 flex-none">
              <svg role="img" aria-label={summary} viewBox="0 0 42 42" className="size-full">
                <circle
                  cx={21}
                  cy={21}
                  r={R}
                  fill="none"
                  stroke="var(--superficie-funda)"
                  strokeWidth={6}
                />
                {arcs.map((arc, i) => (
                  <circle
                    key={slices[i]!.key}
                    cx={21}
                    cy={21}
                    r={R}
                    fill="none"
                    stroke={slices[i]!.other ? OTHER_STROKE : STROKE[i]}
                    strokeWidth={6}
                    strokeDasharray={arc.dash}
                    strokeDashoffset={arc.offset}
                  />
                ))}
              </svg>
              <div
                aria-hidden="true"
                className="absolute inset-0 flex flex-col items-center justify-center text-center"
              >
                <span className="text-caption text-tinta-suave">Saiu</span>
                <Money cents={sum} whole className="font-mono text-label text-tinta" />
              </div>
            </div>

            <ul className="flex w-full min-w-0 flex-col gap-3">
              {named.map(({ slice, name }, i) => (
                <li key={slice.key} className="flex items-center gap-2 sm:gap-3">
                  <span
                    aria-hidden="true"
                    className={`size-3 flex-none rounded-[3px] ${slice.other ? OTHER_SWATCH : SWATCH[i]}`}
                  />
                  <CategoryIcon
                    icon={slice.other ? "outros" : findCategory(categories, slice.key).icon}
                    kind="expense"
                    size="sm"
                    className="max-sm:hidden"
                  />
                  <span className="min-w-0 flex-1 truncate text-body text-tinta">{name}</span>
                  <Money cents={slice.cents} className="font-mono text-amount" />
                  <span className="w-10 text-right text-caption text-tinta-suave">
                    {slice.percent}%
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <TableToggle>
            <table className="mt-2 w-full text-left text-caption">
              <caption className="md-sr">Gastos de {monthName(month)} por categoria</caption>
              <thead>
                <tr className="border-b border-veio text-tinta-suave">
                  <th scope="col" className="py-2 font-semibold">
                    Categoria
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Saiu
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Parte
                  </th>
                </tr>
              </thead>
              <tbody>
                {slices.flatMap((slice) =>
                  slice.categoryIds.map((id) => {
                    const cents = totals.get(id) ?? 0;
                    return (
                      <tr key={id} className="border-b border-veio last:border-b-0">
                        <th scope="row" className="py-2 font-normal text-tinta">
                          {findCategory(categories, id).name}
                        </th>
                        <td className="py-2 text-right text-gasto">
                          <Money cents={cents} />
                        </td>
                        <td className="py-2 text-right text-tinta tabular-nums">
                          {floorPercent(cents, sum)}%
                        </td>
                      </tr>
                    );
                  }),
                )}
              </tbody>
            </table>
          </TableToggle>
        </>
      ) : (
        <p className="text-tinta-suave">
          Quando você anotar um gasto em {monthName(month)}, ele aparece aqui.
        </p>
      )}
      {footer ? <div className="mt-3">{footer}</div> : null}
    </section>
  );
}
