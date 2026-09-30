/* eslint-disable @next/next/no-img-element -- selo SVG servido do próprio app. */
import type { Metadata } from "next";
import Link from "next/link";

import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = { title: "Conta apagada" };

/** Depois de apagar a conta (docs/design-system/17-padroes-de-tela.md#conta-apagada). Sem sessão e sem dados. */
export default function AccountDeletedPage() {
  return (
    <main
      id="conteudo"
      className="mx-auto flex min-h-dvh max-w-100 flex-col items-center justify-center gap-4 px-4 text-center"
    >
      <img src="/marca/midas-selo-contorno.svg" alt="" aria-hidden="true" className="w-24" />
      <h1 className="font-display text-display-lg text-tinta">Sua conta foi apagada.</h1>
      <p className="text-body text-tinta">Obrigado por ter usado o Midas.</p>
      <p className="text-caption text-tinta-suave">
        Cópias de segurança são apagadas em até 7 dias. Enviamos uma confirmação para o seu e-mail.
      </p>
      <Link href="/entrar" className={buttonClasses({ variant: "secondary" })}>
        Voltar para o início
      </Link>
    </main>
  );
}
