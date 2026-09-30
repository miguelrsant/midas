import type { Metadata } from "next";
import Link from "next/link";

import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Calculadoras" };

export default async function Page() {
  await requireUser();
  return (
    <div className="flex flex-col gap-6 pt-4">
      <h1 className="font-display text-display-lg text-tinta">Calculadoras</h1>
      <EmptyState
        title={
          <>
            Férias, 13º e <em className="md-acento">rescisão</em>.
          </>
        }
        action={
          <Link href="/" className={buttonClasses({ variant: "secondary" })}>
            Voltar para o início
          </Link>
        }
      >
        Aqui vão ficar as calculadoras que já colocam o dinheiro no seu planejamento. Chegam na
        próxima versão.
      </EmptyState>
    </div>
  );
}
