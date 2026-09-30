"use client";

import { TriangleAlert } from "lucide-react";
import { type RefObject, useEffect } from "react";

import { cn } from "@/lib/cn";
import type { EntryKind } from "@/lib/entry";

/**
 * Campo de valor (docs/design-system/componentes/money-input.md): texto com teclado
 * decimal, formatado só ao sair; o sinal vem do tipo. Erros só ao salvar.
 */
export function MoneyInput({
  id,
  label,
  kind,
  text,
  onTextChange,
  error,
  onBlur,
  help = "Use vírgula para os centavos.",
  focusOnMount,
  disabled,
  onEnter,
  inputRef,
}: {
  id: string;
  label: string;
  kind?: EntryKind;
  text: string;
  onTextChange: (text: string) => void;
  error?: string | null;
  onBlur?: () => void;
  help?: string;
  /** Foco ao abrir (a tela de lançamento começa pelo valor). */
  focusOnMount?: boolean;
  disabled?: boolean;
  onEnter?: () => void;
  inputRef: RefObject<HTMLInputElement | null>;
}) {
  useEffect(() => {
    if (focusOnMount) inputRef.current?.focus();
  }, [focusOnMount, inputRef]);
  const color = kind === "income" ? "text-renda" : kind === "expense" ? "text-gasto" : "text-tinta";
  const describedBy = error ? `${id}-erro` : `${id}-ajuda`;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-title text-tinta">
        {label}
        <span className="md-sr"> em reais</span>
      </label>
      <div
        className={cn(
          "flex min-h-16 w-full max-w-90 items-center gap-2 rounded-md border bg-superficie-funda px-4 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-foco",
          error ? "border-2 border-alerta" : "border-borda",
        )}
      >
        <span aria-hidden="true" className={cn("text-[2rem] leading-10 font-semibold", color)}>
          {kind === "income" ? "+" : kind === "expense" ? "−" : null} R$
        </span>
        <input
          ref={inputRef}
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          enterKeyHint="next"
          spellCheck={false}
          maxLength={20}
          disabled={disabled}
          value={text}
          onChange={(event) => onTextChange(event.target.value)}
          onBlur={onBlur}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onEnter?.();
            }
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "min-w-0 flex-1 border-0 bg-transparent py-3 text-[2rem] leading-10 font-semibold tabular-nums outline-none",
            color,
          )}
        />
      </div>
      {error ? (
        <p id={`${id}-erro`} className="flex gap-2 text-caption text-tinta">
          <TriangleAlert
            aria-hidden="true"
            className="mt-0.5 size-4 flex-none text-alerta"
            strokeWidth={1.75}
          />
          {error}
        </p>
      ) : (
        <p id={`${id}-ajuda`} className="text-caption text-tinta-suave">
          {help}
        </p>
      )}
    </div>
  );
}
