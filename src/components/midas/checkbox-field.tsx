"use client";

import { type ReactNode, useId } from "react";

/** Caixa de seleção grande (48px) com rótulo e ajuda ligados por id. */
export function CheckboxField({
  label,
  help,
  checked,
  onChange,
  error,
}: {
  label: string;
  help?: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
}) {
  const id = useId();
  return (
    <div className="flex min-h-12 items-start gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        aria-describedby={help || error ? `${id}-ajuda` : undefined}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 size-5 flex-none cursor-pointer accent-[var(--ouro)]"
      />
      <div>
        <label htmlFor={id} className="block cursor-pointer text-label text-tinta">
          {label}
        </label>
        {help || error ? (
          <p id={`${id}-ajuda`} className="text-caption text-tinta-suave">
            {help}
            {error ? <span className="block text-tinta">{error}</span> : null}
          </p>
        ) : null}
      </div>
    </div>
  );
}
