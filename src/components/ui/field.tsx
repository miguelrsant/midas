import { TriangleAlert } from "lucide-react";
import type { InputHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

/** Campo de texto do Midas: rótulo visível, ajuda e erro ligados por aria-describedby. */

export const inputBoxClasses =
  "flex min-h-13 items-center gap-2 rounded-md border border-borda bg-superficie-funda px-4 " +
  "focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-foco " +
  "has-[input[aria-invalid=true]]:border-2 has-[input[aria-invalid=true]]:border-gasto";

export const inputClasses =
  "min-w-0 flex-1 border-0 bg-transparent py-3 text-body text-tinta outline-none " +
  "placeholder:text-tinta-suave autofill:shadow-[inset_0_0_0_100px_var(--superficie-funda)] " +
  "autofill:[-webkit-text-fill-color:var(--tinta)]";

export function FieldMessages({
  id,
  help,
  error,
}: {
  id: string;
  help?: ReactNode;
  error?: string | null;
}) {
  return (
    <>
      {help ? (
        <p id={`${id}-ajuda`} className="text-caption text-tinta-suave">
          {help}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-erro`} className="flex gap-2 text-caption text-tinta">
          <TriangleAlert
            aria-hidden="true"
            className="mt-0.5 size-4 flex-none text-gasto"
            strokeWidth={1.75}
          />
          <span>{error}</span>
        </p>
      ) : null}
    </>
  );
}

export function describedBy(id: string, help?: ReactNode, error?: string | null) {
  return (
    [help ? `${id}-ajuda` : null, error ? `${id}-erro` : null].filter(Boolean).join(" ") ||
    undefined
  );
}

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id: string;
  label: ReactNode;
  help?: ReactNode;
  error?: string | null;
};

export function TextField({ id, label, help, error, className, ...props }: TextFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label htmlFor={id} className="text-label text-tinta">
        {label}
      </label>
      <span className={inputBoxClasses}>
        <input
          id={id}
          className={inputClasses}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, help, error)}
          {...props}
        />
      </span>
      <FieldMessages id={id} help={help} error={error} />
    </div>
  );
}
