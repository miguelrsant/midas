import type { Metadata } from "next";
import Link from "next/link";

import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Planejamento" };

export default async function Page() {
  await requireUser();
  return (
    <div className="flex flex-col gap-6 pt-4">
      <h1 className="font-display text-display-lg text-tinta">Planejamento</h1>
      <EmptyState
        title={
          <>
            Os próximos meses, <em className="md-acento">em ordem</em>.
          </>
        }
        action={
          <Link href="/" className={buttonClasses({ variant: "secondary" })}>
            Voltar para o início
          </Link>
        }
      >
        Aqui você vai ver como devem ficar os próximos meses, com rendas e gastos fixos. Chega na
        próxima versão.
      </EmptyState>
    </div>
  );
}
