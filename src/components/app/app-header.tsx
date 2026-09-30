import Link from "next/link";

import { Logo } from "@/components/brand/logo";

import { AccountMenu } from "./account-menu";
import { TopNav } from "./app-nav";

/**
 * Topo das telas logadas (docs/design-system/componentes/app-header.md): logo, navegação
 * (só a partir de 1024px) e a conta. Rola com a página; não é fixo.
 * A troca de mês entra com as telas que mostram um mês.
 */
export function AppHeader({ nickname }: { nickname: string }) {
  return (
    <header className="mx-auto flex w-full max-w-180 items-center justify-between gap-4 px-4 py-3">
      <Link
        href="/"
        className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco"
      >
        <Logo className="h-7 w-auto sm:h-8" />
      </Link>
      <TopNav />
      <AccountMenu nickname={nickname} />
    </header>
  );
}
