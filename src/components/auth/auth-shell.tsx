/* eslint-disable @next/next/no-img-element -- ornamento SVG servido do próprio app. */
import type { ReactNode } from "react";

import { Logo } from "@/components/brand/logo";
import { ShieldCheck } from "lucide-react";

/**
 * Moldura das telas de entrada, cadastro e recuperação
 * (docs/design-system/componentes/login-screen.md): mármore pleno, selo decorativo
 * no canto e o cartão com o conteúdo.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main
      id="conteudo"
      className="md-marmore-pleno relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-6"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-25 -bottom-25 opacity-55 sm:-right-30 sm:-bottom-30"
      >
        <img src="/marca/midas-selo-contorno.svg" alt="" className="size-70 sm:size-95" />
      </div>
      <div className="relative flex w-full max-w-110 flex-col gap-3 rounded-lg bg-superficie px-6 py-5 shadow-cartao sm:px-8">
        <div className="flex justify-center">
          <Logo className="h-9 w-auto" />
        </div>
        {children}
        <p
          role="note"
          className="flex items-start justify-center gap-2 text-caption text-tinta-suave"
        >
          <ShieldCheck
            aria-hidden="true"
            className="mt-0.5 size-4 flex-none text-ouro-texto"
            strokeWidth={1.75}
          />
          <span>Sem CPF e sem acesso ao seu banco. Seus dados são só seus.</span>
        </p>
      </div>
    </main>
  );
}

export function AuthTitle({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h1
      id={id}
      tabIndex={id ? -1 : undefined}
      className="text-center font-display text-[1.875rem] leading-9 text-tinta outline-none"
    >
      {children}
    </h1>
  );
}

export function Accent({ children }: { children: ReactNode }) {
  return <em className="md-acento">{children}</em>;
}

export function GoldVein() {
  return <hr className="md-veio" />;
}
