import type { Metadata } from "next";

import { requireUser } from "@/lib/auth/dal";
import { loadFormCategories } from "@/lib/data/form-categories";
import { todayInSaoPaulo } from "@/lib/dates";

import { RecurringForm } from "../recurring-form";

export const metadata: Metadata = { title: "Adicionar fixo" };

export default async function NewRecurringPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; modelo?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const today = todayInSaoPaulo();
  return (
    <RecurringForm
      mode="new"
      today={today}
      categories={await loadFormCategories(user.id, today)}
      initial={{
        kind: params.tipo === "renda" ? "income" : "expense",
        presetId: params.modelo?.slice(0, 40) ?? null,
      }}
    />
  );
}
