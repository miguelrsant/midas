import { type Category, findCategory, sortByValueOtherLast } from "@/lib/categories";
import { floorPercent } from "@/lib/money";

import { Bar } from "./bar";
import { CategoryIcon } from "./category-icon";
import { Money } from "./money";

/** Barras por categoria (docs/design-system/13-graficos-e-dados.md#barras-por-categoria). */
export function CategoryBars({
  totals,
  categories,
  kind = "expense",
}: {
  totals: ReadonlyMap<string, number>;
  categories: readonly Category[];
  kind?: "expense" | "income";
}) {
  const items = sortByValueOtherLast(
    [...totals.entries()].map(([categoryId, cents]) => ({ categoryId, cents })),
  );
  const max = Math.max(1, ...items.map((i) => i.cents));
  const sum = items.reduce((s, i) => s + i.cents, 0);
  return (
    <ul className="flex flex-col gap-4">
      {items.map((item) => {
        const category = findCategory(categories, item.categoryId);
        return (
          <li key={item.categoryId} className="flex flex-col gap-1.5">
            <span className="flex items-center gap-3">
              <CategoryIcon icon={category.icon} kind={kind} size="sm" />
              <span className="flex-1 text-body text-tinta">{category.name}</span>
              <Money cents={item.cents} className="font-mono text-amount" />
              <span className="w-10 text-right text-caption text-tinta-suave">
                {floorPercent(item.cents, sum)}%
              </span>
            </span>
            <Bar percent={(item.cents / max) * 100} tone={kind === "income" ? "renda" : "gasto"} />
          </li>
        );
      })}
    </ul>
  );
}
