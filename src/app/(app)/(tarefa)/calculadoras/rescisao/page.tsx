import type { Metadata } from "next";

import { requireUser } from "@/lib/auth/dal";
import { todayInSaoPaulo } from "@/lib/dates";

import { TerminationCalculator } from "./termination-calculator";

export const metadata: Metadata = { title: "Rescisão" };

export default async function Page() {
  await requireUser();
  return <TerminationCalculator today={todayInSaoPaulo()} />;
}
