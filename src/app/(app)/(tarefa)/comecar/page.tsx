import type { Metadata } from "next";

import { requireUser } from "@/lib/auth/dal";
import { monthOf, todayInSaoPaulo } from "@/lib/dates";

import { StarterWizard } from "./starter-wizard";

export const metadata: Metadata = { title: "Monte seu mês" };

export default async function StarterPage() {
  await requireUser();
  const today = todayInSaoPaulo();
  return <StarterWizard today={today} month={monthOf(today)} />;
}
