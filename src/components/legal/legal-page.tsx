import Link from "next/link";
import type { ReactNode } from "react";

import { Logo } from "@/components/brand/logo";
import { Notice } from "@/components/ui/notice";

export function LegalPage({
  title,
  version,
  children,
}: {
  title: string;
  version?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh">
      <header className="mx-auto max-w-2xl px-4 py-6">
        <Link href="/" className="inline-block rounded-sm">
          <Logo className="h-8 w-auto" />
        </Link>
      </header>
      <main id="conteudo" className="mx-auto flex max-w-2xl flex-col gap-6 px-4 pb-12">
        <h1 className="font-display text-display-lg text-tinta">{title}</h1>
        {version ? (
          <p className="text-caption text-tinta-suave">
            Versão de {version.split("-").reverse().join("/")}
          </p>
        ) : null}
        <div className="flex flex-col gap-4 [&_h2]:mt-4 [&_h2]:font-display [&_h2]:text-heading [&_ul]:list-disc [&_ul]:pl-6">
          {children}
        </div>
      </main>
    </div>
  );
}

export function DraftNotice() {
  return (
    <Notice tone="alerta" role="note">
      <strong>Rascunho.</strong> Este texto ainda passa por revisão jurídica antes de o Midas abrir
      para o público.
    </Notice>
  );
}
