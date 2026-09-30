import type { Metadata, Route } from "next";

import { requireUser } from "@/lib/auth/dal";
import { loadFormCategories } from "@/lib/data/form-categories";
import { isMonthKey, lastDay, monthOf, todayInSaoPaulo } from "@/lib/dates";
import { safeRedirectPath } from "@/lib/safe-redirect";

import { EntryForm } from "../entry-form";

export const metadata: Metadata = { title: "Adicionar lançamento" };

export default async function NewEntryPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; mes?: string; de?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const today = todayInSaoPaulo();
  const categories = await loadFormCategories(user.id, today);
  // Vindo de um mês passado ("Adicionar lançamento em agosto"): "Outro dia" com o último dia dele.
  const month =
    params.mes && isMonthKey(params.mes) && params.mes < monthOf(today) ? params.mes : null;
  return (
    <EntryForm
      mode="new"
      today={today}
      categories={categories}
      backHref={safeRedirectPath(params.de, "/") as Route}
      initial={{
        kind: params.tipo === "renda" ? "income" : "expense",
        date: month ? lastDay(month) : undefined,
      }}
    />
  );
}
