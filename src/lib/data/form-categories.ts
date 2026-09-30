import "server-only";

import { formCategories } from "@/lib/categories";
import type { DateOnly } from "@/lib/dates";

import { loadCategories } from "./categories";
import { categoryUsage } from "./entries";

/** Categorias do formulário, na ordem de uso dos últimos 90 dias, para os dois tipos. */
export async function loadFormCategories(userId: string, today: DateOnly, keepId?: string | null) {
  const [categories, usage] = await Promise.all([
    loadCategories(userId),
    categoryUsage(userId, today),
  ]);
  return {
    expense: formCategories(categories, "expense", usage, keepId),
    income: formCategories(categories, "income", usage, keepId),
  };
}
