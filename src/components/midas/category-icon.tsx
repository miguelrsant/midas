import { createElement } from "react";

import { categoryIcon } from "@/lib/category-icons";
import { cn } from "@/lib/cn";
import type { EntryKind } from "@/lib/entry";

/** Ícone da categoria num círculo de 44px: gasto em tinta, renda em azul-petróleo. */
export function CategoryIcon({
  icon,
  kind,
  size = "md",
  className,
}: {
  icon: string;
  kind: EntryKind;
  size?: "md" | "sm";
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex flex-none items-center justify-center rounded-pill",
        size === "md" ? "size-11" : "size-9",
        kind === "income" ? "bg-renda-fundo text-renda" : "bg-superficie-funda text-tinta",
        className,
      )}
    >
      {createElement(categoryIcon(icon), {
        className: size === "md" ? "size-5" : "size-4",
        strokeWidth: 1.75,
      })}
    </span>
  );
}
