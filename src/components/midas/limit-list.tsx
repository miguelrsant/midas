import type { Route } from "next";
import Link from "next/link";

import { type Category, findCategory } from "@/lib/categories";
import { type MonthKey, monthName } from "@/lib/dates";
import { limitStatus } from "@/lib/finance/limits";
import { limitDetail } from "@/lib/finance/phrases";
import { formatWholeMoney } from "@/lib/money";

import { Bar } from "./bar";
import { CategoryIcon } from "./category-icon";

/** Barras de limite por categoria: da mais perto do limite para a mais longe. */
export function LimitList({
  limits,
  spent,
  categories,
  month,
}: {
  limits: ReadonlyMap<string, number>;
  spent: ReadonlyMap<string, number>;
  categories: readonly Category[];
  month: MonthKey;
}) {
  const rows = [...limits.entries()]
    .map(([categoryId, limitCents]) => ({
      categoryId,
      limitCents,
      spentCents: spent.get(categoryId) ?? 0,
    }))
    .sort((a, b) => b.spentCents * a.limitCents - a.spentCents * b.limitCents);
  return (
    <ul className="flex flex-col">
      {rows.map((row) => {
        const category = findCategory(categories, row.categoryId);
        const status = limitStatus(row.spentCents, row.limitCents);
        return (
          <li key={row.categoryId} className="border-b border-veio last:border-b-0">
            <Link
              href={`/planejamento/limites/${row.categoryId}` as Route}
              className="flex flex-col gap-2 px-2 py-3 hover:bg-superficie-funda focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foco"
            >
              <span className="flex items-center gap-3">
                <CategoryIcon icon={category.icon} kind="expense" size="sm" />
                <span className="flex-1 text-body font-semibold text-tinta">{category.name}</span>
                <span className="text-caption text-tinta-suave">
                  <span className="md-valor">
                    {formatWholeMoney(row.spentCents)} de {formatWholeMoney(row.limitCents)}
                  </span>
                  <span className="md-oculto">valor oculto</span> em {monthName(month)}
                </span>
              </span>
              <Bar percent={status.percent} tone={status.state === "ok" ? "ouro" : "alerta"} />
              <span className="text-caption text-tinta-suave">
                <span className="md-valor">{limitDetail(row.spentCents, row.limitCents)}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
