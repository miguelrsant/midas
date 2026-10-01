"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * "Voltar" das páginas públicas (privacidade, termos, sobre): volta para a tela do Midas
 * de onde a pessoa veio (cadastro, "Seus dados"...); aberta direto, vai para o início.
 */
export function BackLink() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        const fromMidas =
          document.referrer !== "" && new URL(document.referrer).origin === window.location.origin;
        if (fromMidas && window.history.length > 1) router.back();
        else router.push("/");
      }}
      className="inline-flex min-h-11 items-center gap-1 rounded-md pr-3 text-label text-tinta hover:bg-superficie-funda focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco"
    >
      <ChevronLeft aria-hidden="true" className="size-5" strokeWidth={1.75} />
      Voltar
    </button>
  );
}
