import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { ResultView } from "@/components/midas/calculator/result-view";
import { TaskHeader } from "@/components/midas/task-header";
import { buttonClasses } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/dal";
import { getCalculation } from "@/lib/data/planning";
import { formatShortDate } from "@/lib/dates";
import { CALCULATOR_NAMES, HEADLINE_LABELS } from "@/lib/labor/kinds";

export const metadata: Metadata = { title: "Sua conta" };

/** "Ver a conta": a conta guardada, do jeito que foi feita (sem refazer com tabelas novas). */
export default async function SavedCalculationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const calculation = await getCalculation(user.id, id);
  if (!calculation?.data) notFound();
  const name = CALCULATOR_NAMES[calculation.kind];
  return (
    <>
      <TaskHeader title={name} backHref="/calculadoras" />
      <div className="flex flex-col gap-6">
        <p className="text-body text-tinta-suave">
          Conta feita em {formatShortDate(calculation.createdAt)}. Ela fica como foi feita: para
          mudar algo, refaça a conta.
        </p>
        <ResultView
          result={calculation.data.result}
          title={`${name}, em números.`}
          headlineLabel={HEADLINE_LABELS[calculation.kind]}
        />
        <Link href="/calculadoras" className={buttonClasses({ variant: "secondary" })}>
          Voltar para as calculadoras
        </Link>
      </div>
    </>
  );
}
