"use client";

import { Check, ChevronDown, Minus, Plus } from "lucide-react";
import { createElement, type ReactNode, useRef, useState } from "react";
import { flushSync } from "react-dom";

import type { Category } from "@/lib/categories";
import { categoryIcon } from "@/lib/category-icons";
import { cn } from "@/lib/cn";
import type { EntryKind } from "@/lib/entry";

/**
 * Escolhas com rádios nativos em fieldset (docs/design-system/12-acessibilidade.md#formulários):
 * setas movem entre as opções, e o leitor de tela anuncia o grupo.
 */

const pill =
  "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-pill border px-4 text-label " +
  "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-foco";
const pillOff = "border-borda bg-superficie text-tinta hover:bg-superficie-funda";
const pillOn = "border-ouro bg-ouro text-sobre-ouro";

/** Gasto | Renda (componentes/segmented-toggle.md). */
export function SegmentedToggle({
  value,
  onValueChange,
  name = "kind",
  disabled,
}: {
  value: EntryKind;
  onValueChange: (kind: EntryKind) => void;
  name?: string;
  disabled?: boolean;
}) {
  const options: Array<{ value: EntryKind; label: string; Icon: typeof Minus }> = [
    { value: "expense", label: "Gasto", Icon: Minus },
    { value: "income", label: "Renda", Icon: Plus },
  ];
  return (
    <fieldset
      className="flex w-full rounded-pill bg-superficie-funda p-1 sm:w-auto"
      disabled={disabled}
    >
      <legend className="md-sr">Tipo de lançamento</legend>
      {options.map(({ value: v, label, Icon }) => {
        const checked = value === v;
        return (
          <label
            key={v}
            className={cn(
              "flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-pill px-5 text-label sm:flex-none",
              "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-foco",
              checked
                ? cn(
                    "border border-borda bg-superficie shadow-cartao",
                    v === "income" ? "text-renda" : "text-gasto",
                  )
                : "text-tinta-suave",
            )}
          >
            <input
              type="radio"
              name={name}
              value={v}
              checked={checked}
              onChange={() => onValueChange(v)}
              className="md-sr"
            />
            <Icon aria-hidden="true" className="size-4" strokeWidth={2} />
            {label}
          </label>
        );
      })}
    </fieldset>
  );
}

/** Pílulas de escolha única (Hoje/Ontem/Outro dia, filtros). */
export function ChoiceChips<T extends string>({
  legend,
  legendHidden = false,
  name,
  options,
  value,
  onValueChange,
}: {
  legend: string;
  legendHidden?: boolean;
  name: string;
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onValueChange: (value: T) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className={cn("mb-2 text-label text-tinta", legendHidden && "md-sr")}>
        {legend}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label key={o.value} className={cn(pill, value === o.value ? pillOn : pillOff)}>
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onValueChange(o.value)}
              className="md-sr"
            />
            {value === o.value ? (
              <Check aria-hidden="true" className="size-4" strokeWidth={2} />
            ) : null}
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Chips de categoria (componentes/category-chip.md): 6 mais usadas e "Mais". */
export function CategoryChips({
  categories,
  value,
  onValueChange,
  visibleCount = 6,
  name = "category",
  legend = "Categoria",
}: {
  categories: readonly Category[];
  value: string | null;
  onValueChange: (id: string) => void;
  visibleCount?: number;
  name?: string;
  legend?: string;
}) {
  const selectedIndex = categories.findIndex((c) => c.id === value);
  const [opened, setOpened] = useState(false);
  const firstRevealed = useRef<HTMLInputElement>(null);
  const hasMore = categories.length > visibleCount + 1;
  // Aberto se a pessoa tocou em "Mais" ou se a categoria escolhida está depois das 6 primeiras.
  const expanded = opened || selectedIndex >= visibleCount;
  const shown = expanded || !hasMore ? categories : categories.slice(0, visibleCount);

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-label text-tinta">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {shown.map((c, i) => {
          const checked = c.id === value;
          return (
            <label key={c.id} className={cn(pill, checked ? pillOn : pillOff)}>
              <input
                ref={i === visibleCount ? firstRevealed : undefined}
                type="radio"
                name={name}
                value={c.id}
                checked={checked}
                onChange={() => onValueChange(c.id)}
                className="md-sr"
              />
              {createElement(checked ? Check : categoryIcon(c.icon), {
                "aria-hidden": true,
                className: "size-5",
                strokeWidth: 1.75,
              })}
              {c.name}
            </label>
          );
        })}
        {hasMore && !expanded ? (
          <button
            type="button"
            className={cn(pill, pillOff)}
            onClick={() => {
              flushSync(() => setOpened(true));
              firstRevealed.current?.focus();
            }}
          >
            Mais<span className="md-sr"> categorias</span>
            <ChevronDown aria-hidden="true" className="size-4" strokeWidth={1.75} />
          </button>
        ) : null}
      </div>
    </fieldset>
  );
}

/** Rádios grandes com ajuda (componentes/radio-cards.md). */
export function RadioCards<T extends string>({
  legend,
  name,
  options,
  value,
  onValueChange,
  error,
}: {
  legend: ReactNode;
  name: string;
  options: ReadonlyArray<{ value: T; label: string; help?: string }>;
  value: T | null;
  onValueChange: (value: T) => void;
  error?: string | null;
}) {
  return (
    <fieldset
      className={cn("flex flex-col gap-2", error && "rounded-md border-2 border-alerta p-2")}
    >
      <legend className="mb-3 text-title text-tinta">{legend}</legend>
      {options.map((o) => {
        const checked = value === o.value;
        return (
          <label
            key={o.value}
            className={cn(
              "flex min-h-12 cursor-pointer items-start gap-3 rounded-md border bg-superficie p-4",
              "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-foco",
              checked ? "border-2 border-ouro" : "border-borda",
            )}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={checked}
              onChange={() => onValueChange(o.value)}
              className="mt-1 size-5 flex-none accent-[var(--ouro)]"
            />
            <span>
              <span className="block text-body font-semibold text-tinta">{o.label}</span>
              {o.help ? (
                <span className="block text-caption text-tinta-suave">{o.help}</span>
              ) : null}
            </span>
          </label>
        );
      })}
      {error ? <p className="text-caption text-tinta">{error}</p> : null}
    </fieldset>
  );
}
