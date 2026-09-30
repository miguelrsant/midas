"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";

import { cn } from "@/lib/cn";

/**
 * Atalhos que preenchem categoria e descrição com um toque
 * (docs/design-system/componentes/shortcuts.md). São botões, não escolhas.
 */
export function Shortcuts<T extends { id: string; label: string }>({
  items,
  onPick,
  visibleCount = 5,
  title = "Atalhos",
  help = "Preenche categoria e descrição.",
}: {
  items: readonly T[];
  onPick: (item: T) => void;
  visibleCount?: number;
  title?: string;
  help?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const titleId = useId();
  const helpId = useId();
  const hasMore = items.length > visibleCount + 1;
  const shown = expanded || !hasMore ? items : items.slice(0, visibleCount);
  if (items.length === 0) return null;
  const chip =
    "inline-flex min-h-11 items-center gap-1 rounded-pill border border-borda bg-superficie px-4 text-label text-tinta hover:bg-superficie-funda focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco";
  return (
    <div
      role="group"
      aria-labelledby={titleId}
      aria-describedby={helpId}
      className="flex flex-col gap-2"
    >
      <p id={titleId} className="text-label text-tinta">
        {title}{" "}
        <span id={helpId} className="font-normal text-tinta-suave">
          · {help}
        </span>
      </p>
      <div className="flex flex-wrap gap-2">
        {shown.map((item) => (
          <button key={item.id} type="button" className={chip} onClick={() => onPick(item)}>
            {item.label}
          </button>
        ))}
        {hasMore && !expanded ? (
          <button
            type="button"
            className={cn(chip, "text-tinta-suave")}
            onClick={() => setExpanded(true)}
          >
            Mais<span className="md-sr"> atalhos</span>
            <ChevronDown aria-hidden="true" className="size-4" strokeWidth={1.75} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
