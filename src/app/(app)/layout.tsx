import type { ReactNode } from "react";

import { requireUser } from "@/lib/auth/dal";

/**
 * Área logada: confere a sessão no servidor. Cada página também chama requireUser()
 * antes de ler dados. As telas principais (com navegação) ficam em (principal); as
 * telas de tarefa (adicionar, editar, passos), em (tarefa), só com "Voltar".
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  await requireUser();
  return <div className="min-h-dvh">{children}</div>;
}
