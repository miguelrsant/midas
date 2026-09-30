"use client";

import "./globals.css";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-marmore text-tinta">
        <main className="mx-auto flex min-h-dvh max-w-120 flex-col justify-center gap-4 px-4">
          <h1 className="text-display-lg">Algo deu errado.</h1>
          <p>Não deu para carregar agora. Tente de novo em alguns instantes.</p>
          <div>
            <button
              type="button"
              onClick={reset}
              className="min-h-14 rounded-md bg-primario px-8 text-body font-semibold text-sobre-primario"
            >
              Tentar de novo
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
