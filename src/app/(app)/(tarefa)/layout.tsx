import type { ReactNode } from "react";

/**
 * Telas de tarefa (docs/design-system/17-padroes-de-tela.md#telas-de-tarefa): sem navegação,
 * para ninguém sair no meio de uma tarefa sem querer. Cada página tem o TaskHeader.
 */
export default function TaskLayout({ children }: { children: ReactNode }) {
  return (
    <main
      id="conteudo"
      tabIndex={-1}
      className="mx-auto w-full max-w-120 px-4 pb-16 focus:outline-none"
    >
      {children}
    </main>
  );
}
