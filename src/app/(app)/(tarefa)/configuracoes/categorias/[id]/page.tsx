import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/dal";
import { OTHER_EXPENSE, OTHER_INCOME, systemCategory } from "@/lib/categories";
import { countEntriesInCategory, loadCategories } from "@/lib/data/categories";

import { CategoryForm } from "../category-form";

export const metadata: Metadata = { title: "Editar categoria" };

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const category = (await loadCategories(user.id)).find((c) => c.id === id && !c.fromCalculator);
  if (!category) notFound();
  const original = category.system ? systemCategory(category.id)! : null;
  return (
    <CategoryForm
      mode="edit"
      kind={category.kind}
      initial={{
        id: category.id,
        name: category.system && category.name === original?.name ? "" : category.name,
        icon: category.icon,
        hidden: category.hidden,
        system: category.system,
        isOther: category.id === OTHER_EXPENSE || category.id === OTHER_INCOME,
        original: original ? { name: original.name, icon: original.icon } : null,
        entries: category.system ? 0 : await countEntriesInCategory(user.id, category.id),
      }}
    />
  );
}
