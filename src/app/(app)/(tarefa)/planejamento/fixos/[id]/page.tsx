import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";

import { requireUser } from "@/lib/auth/dal";
import { loadFormCategories } from "@/lib/data/form-categories";
import { getSalaryGroup } from "@/lib/data/recurring";
import { todayInSaoPaulo } from "@/lib/dates";
import { ADVANCE_DAY, DEFAULT_ADVANCE_PERCENT, inferAdvancePercent } from "@/lib/finance/salary";

import { RecurringForm } from "../recurring-form";

export const metadata: Metadata = { title: "Editar fixo" };

export default async function EditRecurringPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  // Abrir o adiantamento abre o salário dele: os dois se editam juntos.
  const group = await getSalaryGroup(user.id, id);
  if (!group) notFound();
  const { salary, advance } = group;
  const today = todayInSaoPaulo();
  const total = salary.amountCents + (advance?.amountCents ?? 0);
  return (
    <RecurringForm
      mode="edit"
      today={today}
      categories={await loadFormCategories(user.id, today, salary.categoryId)}
      initial={{
        ...salary,
        amountCents: total,
        hasAdvance: advance !== null,
        salary: {
          amountIs: "net",
          split: advance !== null,
          advancePercent: advance
            ? inferAdvancePercent(advance.amountCents, total)
            : DEFAULT_ADVANCE_PERCENT,
          advanceDay: advance?.dayOfMonth ?? ADVANCE_DAY,
        },
      }}
    />
  );
}
