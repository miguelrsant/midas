import type { ReactNode } from "react";

import { AppHeader } from "@/components/app/app-header";
import { BottomNav } from "@/components/app/app-nav";
import { requireUser } from "@/lib/auth/dal";

/**
 * Estrutura das telas principais (docs/design-system/17-padroes-de-tela.md#estrutura-do-app):
 * no celular, topo + conteúdo + navegação inferior fixa; a partir de 1024px, a navegação
 * vai para o topo.
 */
export default async function MainLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  return (
    <div className="scroll-pb-24 lg:scroll-pb-0">
      <AppHeader nickname={user.name} />
      <main
        id="conteudo"
        tabIndex={-1}
        className="mx-auto w-full max-w-180 px-4 pb-[calc(4rem+env(safe-area-inset-bottom)+2rem)] focus:outline-none lg:pb-12"
      >
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
