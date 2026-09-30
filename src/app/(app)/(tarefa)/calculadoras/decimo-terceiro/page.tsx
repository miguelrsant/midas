import type { Metadata } from "next";

import { requireUser } from "@/lib/auth/dal";
import { todayInSaoPaulo } from "@/lib/dates";

import { ThirteenthCalculator } from "./thirteenth-calculator";

export const metadata: Metadata = { title: "13º salário" };

export default async function Page() {
  await requireUser();
  return <ThirteenthCalculator today={todayInSaoPaulo()} />;
}
