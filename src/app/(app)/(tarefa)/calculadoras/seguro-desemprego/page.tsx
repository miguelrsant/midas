import type { Metadata } from "next";

import { requireUser } from "@/lib/auth/dal";
import { todayInSaoPaulo } from "@/lib/dates";

import { UnemploymentCalculator } from "./unemployment-calculator";

export const metadata: Metadata = { title: "Seguro-desemprego" };

export default async function Page() {
  await requireUser();
  return <UnemploymentCalculator today={todayInSaoPaulo()} />;
}
