import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { cn } from "@/lib/cn";
import { addMonths, type MonthKey, monthTitle } from "@/lib/dates";

/**
 * Troca de mês (docs/design-system/componentes/app-header.md): do primeiro mês com dados
 * até o mês atual. O mês fica na URL (?mes=2026-09). No limite, o botão fica com
 * aria-disabled (não disabled, para não perder o foco).
 */
export function MonthSwitcher({
  month,
  first,
  last,
  basePath,
}: {
  month: MonthKey;
  first: MonthKey;
  last: MonthKey;
  basePath: string;
}) {
  const prev = addMonths(month, -1);
  const next = addMonths(month, 1);
  const href = (m: MonthKey) => (m === last ? basePath : `${basePath}?mes=${m}`) as Route;
  const arrow =
    "inline-flex size-11 items-center justify-center rounded-pill text-tinta hover:bg-superficie-funda focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco";
  const disabled = "opacity-45 cursor-not-allowed hover:bg-transparent";
  return (
    <div role="group" aria-label="Mês" className="flex items-center gap-1">
      {month > first ? (
        <Link href={href(prev)} aria-label="Mês anterior" className={arrow}>
          <ChevronLeft aria-hidden="true" className="size-5" strokeWidth={1.75} />
        </Link>
      ) : (
        <span
          role="link"
          aria-disabled="true"
          aria-label="Mês anterior"
          className={cn(arrow, disabled)}
        >
          <ChevronLeft aria-hidden="true" className="size-5" strokeWidth={1.75} />
        </span>
      )}
      <span aria-live="polite" className="min-w-[110px] text-center text-label text-tinta">
        {monthTitle(month)}
      </span>
      {month < last ? (
        <Link href={href(next)} aria-label="Próximo mês" className={arrow}>
          <ChevronRight aria-hidden="true" className="size-5" strokeWidth={1.75} />
        </Link>
      ) : (
        <span
          role="link"
          aria-disabled="true"
          aria-label="Próximo mês"
          className={cn(arrow, disabled)}
        >
          <ChevronRight aria-hidden="true" className="size-5" strokeWidth={1.75} />
        </span>
      )}
    </div>
  );
}
