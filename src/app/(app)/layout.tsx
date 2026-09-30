import Link from "next/link";
import type { ReactNode } from "react";

import { Logo } from "@/components/brand/logo";
import { SignOutButton } from "@/components/app/sign-out-button";
import { requireUser } from "@/lib/auth/dal";

/**
 * Área logada. O requireUser() confere a sessão no servidor em toda página;
 * cada página também chama requireUser() antes de ler dados.
 * A navegação completa (Início, Lançamentos, Planejamento, Calculadoras) chega com as telas de finanças.
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  await requireUser();
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="rounded-sm">
          <Logo className="h-8 w-auto" />
        </Link>
        <nav aria-label="Conta" className="flex flex-wrap items-center gap-2">
          <Link href="/seus-dados" className="md-link px-2 py-3">
            Seus dados
          </Link>
          <Link href="/configuracoes" className="md-link px-2 py-3">
            Configurações
          </Link>
          <SignOutButton />
        </nav>
      </header>
      <main id="conteudo" className="mx-auto max-w-5xl px-4 pb-12">
        {children}
      </main>
    </div>
  );
}
