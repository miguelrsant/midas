"use client";

import { Collapsible } from "radix-ui";
import { type ReactNode, useId } from "react";

import { cn } from "@/lib/cn";

/**
 * "Ver em tabela" de um gráfico (docs/design-system/13-graficos-e-dados.md#tabela-alternativa):
 * os mesmos dados numa tabela, escondida até a pessoa pedir.
 */
export function TableToggle({ children, className }: { children: ReactNode; className?: string }) {
  const id = useId();
  return (
    <Collapsible.Root className={cn("mt-3", className)}>
      <Collapsible.Trigger
        aria-controls={id}
        className="inline-flex min-h-11 items-center rounded-md px-3 text-label text-ouro-texto hover:bg-superficie-funda focus-visible:outline-2 focus-visible:outline-foco data-[state=closed]:[&>.aberto]:hidden data-[state=open]:[&>.fechado]:hidden"
      >
        <span className="fechado">Ver em tabela</span>
        <span className="aberto">Esconder tabela</span>
      </Collapsible.Trigger>
      <Collapsible.Content id={id}>{children}</Collapsible.Content>
    </Collapsible.Root>
  );
}
