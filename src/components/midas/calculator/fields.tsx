"use client";

import { useId, useRef } from "react";

import { TextField } from "@/components/ui/field";
import { formatAmount, formatMoney, MONEY_ERRORS, readMoney } from "@/lib/money";

import { MoneyInput } from "../money-input";

/** Campos dos passos das calculadoras: valores guardados como texto digitado. */

export function MoneyField({
  label,
  value,
  onChange,
  error,
  help = "É o valor antes dos descontos, como aparece no contracheque.",
}: {
  label: string;
  value: string;
  onChange: (text: string) => void;
  error?: string;
  help?: string;
}) {
  const id = useId();
  const ref = useRef<HTMLInputElement>(null);
  return (
    <MoneyInput
      id={id}
      label={label}
      text={value}
      inputRef={ref}
      focusOnMount
      error={error}
      help={help}
      onTextChange={onChange}
      onBlur={() => {
        const read = readMoney(value);
        if (read.ok) onChange(formatAmount(read.cents));
      }}
    />
  );
}

export function DateField({
  label,
  value,
  onChange,
  error,
  help,
  min = "2000-01-01",
  max = "2100-12-31",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  help?: string;
  min?: string;
  max?: string;
}) {
  const id = useId();
  return (
    <TextField
      id={id}
      label={label}
      type="date"
      min={min}
      max={max}
      value={value}
      error={error}
      help={help}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function NumberSelect({
  label,
  value,
  onChange,
  from,
  to,
  format = (n) => String(n),
  help,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  from: number;
  to: number;
  format?: (n: number) => string;
  help?: string;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-label text-tinta">
        {label}
      </label>
      <select
        id={id}
        value={value}
        aria-describedby={help ? `${id}-ajuda` : undefined}
        onChange={(event) => onChange(Number(event.target.value))}
        className="min-h-13 w-48 rounded-md border border-borda bg-superficie-funda px-4 text-body text-tinta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco"
      >
        {Array.from({ length: to - from + 1 }, (_, i) => from + i).map((n) => (
          <option key={n} value={n}>
            {format(n)}
          </option>
        ))}
      </select>
      {help ? (
        <p id={`${id}-ajuda`} className="text-caption text-tinta-suave">
          {help}
        </p>
      ) : null}
    </div>
  );
}

/** Lê o texto de dinheiro; vazio = 0 quando o campo é opcional. */
export function cents(text: string, optional = false): number {
  if (optional && text.trim() === "") return 0;
  const read = readMoney(text);
  return read.ok ? read.cents : 0;
}

export function moneyError(text: string, optional = false): string | null {
  if (optional && text.trim() === "") return null;
  const read = readMoney(text);
  return read.ok ? null : MONEY_ERRORS[read.error];
}

export function moneyReview(text: string, optional = false) {
  if (optional && text.trim() === "") return "Nenhum";
  const read = readMoney(text);
  return read.ok ? formatMoney(read.cents) : "—";
}

export const dependentsText = (n: number) =>
  n === 0 ? "Nenhum" : n === 1 ? "1 dependente" : `${n} dependentes`;
