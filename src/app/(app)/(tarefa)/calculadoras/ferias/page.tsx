import type { Metadata } from "next";

import { requireUser } from "@/lib/auth/dal";
import { todayInSaoPaulo } from "@/lib/dates";

import { VacationCalculator } from "./vacation-calculator";

export const metadata: Metadata = { title: "Férias" };

export default async function Page() {
  await requireUser();
  return <VacationCalculator today={todayInSaoPaulo()} />;
}
