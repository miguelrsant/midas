import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";

import { requireUser } from "@/lib/auth/dal";
import { loadFormCategories } from "@/lib/data/form-categories";
import { getRecurring } from "@/lib/data/recurring";
import { todayInSaoPaulo } from "@/lib/dates";

import { RecurringForm } from "../recurring-form";

export const metadata: Metadata = { title: "Editar fixo" };

export default async function EditRecurringPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const recurring = await getRecurring(user.id, id);
  if (!recurring) notFound();
  const today = todayInSaoPaulo();
  return (
    <RecurringForm
      mode="edit"
      today={today}
      categories={await loadFormCategories(user.id, today, recurring.categoryId)}
      initial={recurring}
    />
  );
}
