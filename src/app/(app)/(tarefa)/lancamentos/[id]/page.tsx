import type { Metadata, Route } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";

import { requireUser } from "@/lib/auth/dal";
import { getEntry } from "@/lib/data/entries";
import { loadFormCategories } from "@/lib/data/form-categories";
import { monthOf, todayInSaoPaulo } from "@/lib/dates";
import { safeRedirectPath } from "@/lib/safe-redirect";

import { EntryForm } from "../entry-form";

export const metadata: Metadata = { title: "Editar lançamento" };

export default async function EditEntryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ de?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const entry = await getEntry(user.id, id);
  if (!entry) notFound();
  const today = todayInSaoPaulo();
  const categories = await loadFormCategories(user.id, today, entry.categoryId);
  const month = monthOf(entry.date);
  return (
    <EntryForm
      mode="edit"
      today={today}
      categories={categories}
      backHref={
        safeRedirectPath(
          (await searchParams).de,
          month === monthOf(today) ? "/lancamentos" : `/lancamentos?mes=${month}`,
        ) as Route
      }
      initial={entry}
    />
  );
}
