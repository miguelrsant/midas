import type { Metadata } from "next";

import { requireUser } from "@/lib/auth/dal";
import { todayInSaoPaulo } from "@/lib/dates";

import { NetSalaryCalculator } from "./net-salary-calculator";

export const metadata: Metadata = { title: "Salário líquido" };

export default async function Page() {
  await requireUser();
  return <NetSalaryCalculator today={todayInSaoPaulo()} />;
}
