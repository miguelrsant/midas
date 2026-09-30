import type { Metadata } from "next";
import Link from "next/link";

import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Lançamentos" };

export default async function Page() {
  await requireUser();
  return (
    <div className="flex flex-col gap-6 pt-4">
      <h1 className="font-display text-display-lg text-tinta">Lançamentos</h1>
      <EmptyState
        title={
          <>
            Anotar o que <em className="md-acento">entra</em> e o que sai.
          </>
        }
        action={
          <Link href="/" className={buttonClasses({ variant: "secondary" })}>
            Voltar para o início
          </Link>
        }
      >
        Aqui vai ficar a lista de tudo o que entrou e saiu, mês a mês. Chega na próxima versão.
      </EmptyState>
    </div>
  );
}
