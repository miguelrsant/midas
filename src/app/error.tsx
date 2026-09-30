"use client";

import { Button } from "@/components/ui/button";

/** Nunca mostra códigos nem detalhes do erro (docs/design-system/17-padroes-de-tela.md). */
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      id="conteudo"
      className="mx-auto flex min-h-dvh max-w-120 flex-col justify-center gap-4 px-4"
    >
      <h1 className="font-display text-display-lg text-tinta">Algo deu errado.</h1>
      <p>Não deu para carregar agora. Tente de novo em alguns instantes.</p>
      <div>
        <Button size="lg" onClick={reset}>
          Tentar de novo
        </Button>
      </div>
    </main>
  );
}
