"use client";

import { ChevronLeft } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

import { Bar } from "./bar";

/**
 * Topo das telas de tarefa (docs/design-system/componentes/task-header.md): "Voltar" e o
 * título. Com algo digitado, "Voltar" pergunta antes de sair.
 */
export function TaskHeader({
  title,
  backHref,
  dirty = false,
  step,
  onBack,
}: {
  title: string;
  backHref: Route;
  dirty?: boolean;
  step?: { current: number; total: number };
  /** Nos passos: volta um passo em vez de sair. */
  onBack?: () => boolean;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const keepRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (confirming) keepRef.current?.focus();
  }, [confirming]);

  const leave = () => {
    if (window.history.length > 1) router.back();
    else router.push(backHref);
  };

  return (
    <header className="flex flex-col gap-2 pt-3 pb-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            if (onBack?.()) return;
            if (dirty) setConfirming(true);
            else leave();
          }}
          className="inline-flex min-h-11 items-center gap-1 rounded-md pr-3 text-label text-tinta hover:bg-superficie-funda focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco"
        >
          <ChevronLeft aria-hidden="true" className="size-5" strokeWidth={1.75} />
          Voltar
        </button>
      </div>
      <h1 className="font-display text-display-lg text-tinta">{title}</h1>
      {step ? (
        <div className="flex flex-col gap-1">
          <p aria-live="polite" className="text-caption text-tinta-suave">
            Passo {step.current} de {step.total}
          </p>
          <Bar percent={(step.current / step.total) * 100} />
        </div>
      ) : null}
      {confirming ? (
        <div
          role="group"
          aria-labelledby="sair-sem-salvar"
          className="mt-2 flex flex-col gap-3 rounded-md border border-veio bg-superficie p-4"
        >
          <p id="sair-sem-salvar" className="text-body text-tinta">
            Sair sem salvar? O que você digitou vai se perder.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row-reverse sm:justify-start">
            <Button
              ref={keepRef}
              variant="primary"
              onClick={() => setConfirming(false)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setConfirming(false);
              }}
            >
              Continuar editando
            </Button>
            <Button variant="secondary" onClick={leave}>
              Sair sem salvar
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
