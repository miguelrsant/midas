/* eslint-disable @next/next/no-img-element -- ornamento SVG servido do próprio app. */
import type { ReactNode } from "react";

/** Vazio de começo, em cartão (docs/design-system/componentes/empty-state.md). */
export function EmptyState({
  title,
  children,
  action,
}: {
  title: ReactNode;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="flex flex-col items-center gap-3 rounded-lg bg-superficie px-4 py-8 text-center shadow-cartao">
      <img src="/ornamentos/coluna.svg" alt="" aria-hidden="true" className="w-18 dark:hidden" />
      <img
        src="/ornamentos/coluna-noite.svg"
        alt=""
        aria-hidden="true"
        className="hidden w-18 dark:block"
      />
      <h2 className="font-display text-heading text-tinta">{title}</h2>
      <p className="max-w-[34ch] text-tinta-suave">{children}</p>
      {action}
    </section>
  );
}
