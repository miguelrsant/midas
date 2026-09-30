import type { Metadata, Route } from "next";
import Link from "next/link";

import { CategoryIcon } from "@/components/midas/category-icon";
import { buttonClasses } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/dal";
import type { Category } from "@/lib/categories";
import { loadCategories } from "@/lib/data/categories";

export const metadata: Metadata = { title: "Suas categorias" };

/** "Como deixo as categorias do meu jeito?" (docs/design-system/15-categorias.md#personalização) */
export default async function CategoriesPage() {
  const user = await requireUser();
  const categories = (await loadCategories(user.id)).filter((c) => !c.fromCalculator);
  const section = (kind: "expense" | "income", title: string) => {
    const list = categories.filter((c) => c.kind === kind);
    return (
      <section
        aria-labelledby={`cat-${kind}`}
        className="flex flex-col gap-3 rounded-lg bg-superficie p-4 shadow-cartao"
      >
        <h2 id={`cat-${kind}`} className="px-2 font-display text-heading text-tinta">
          {title}
        </h2>
        <ul className="flex flex-col">
          {list.map((c) => (
            <CategoryRow key={c.id} category={c} />
          ))}
        </ul>
        <Link
          href={
            (kind === "income"
              ? "/configuracoes/categorias/nova?tipo=renda"
              : "/configuracoes/categorias/nova") as Route
          }
          className={buttonClasses({ variant: "secondary" })}
        >
          {kind === "income" ? "Criar categoria de renda" : "Criar categoria de gasto"}
        </Link>
      </section>
    );
  };
  return (
    <div className="mx-auto flex max-w-120 flex-col gap-6 pt-4">
      <h1 className="font-display text-display-lg text-tinta">Suas categorias</h1>
      <p className="text-tinta-suave">
        Crie categorias, troque o nome e o ícone das prontas e esconda do formulário as que você não
        usa. Sem cores: o ícone e o nome bastam.
      </p>
      {section("expense", "Gastos")}
      {section("income", "Rendas")}
    </div>
  );
}

function CategoryRow({ category }: { category: Category }) {
  return (
    <li className="border-b border-veio last:border-b-0">
      <Link
        href={`/configuracoes/categorias/${category.id}` as Route}
        className="grid min-h-16 grid-cols-[44px_1fr_auto] items-center gap-3 px-2 py-2 hover:bg-superficie-funda focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foco"
      >
        <CategoryIcon icon={category.icon} kind={category.kind} />
        <span className="min-w-0">
          <span className="block truncate text-body font-semibold text-tinta">{category.name}</span>
          <span className="block text-caption text-tinta-suave">
            {category.system ? "Pronta" : "Sua"}
            {category.hidden ? " · Escondida do formulário" : ""}
          </span>
        </span>
        <span className="text-label text-ouro-texto">Editar</span>
      </Link>
    </li>
  );
}
