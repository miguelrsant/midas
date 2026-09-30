"use client";

import { Eye, EyeOff } from "lucide-react";
import { type InputHTMLAttributes, type ReactNode, useState } from "react";

import { cn } from "@/lib/cn";

import { buttonClasses } from "./button";
import { describedBy, FieldMessages, inputBoxClasses, inputClasses } from "./field";

/**
 * Campo de senha com "Mostrar"/"Ocultar" (docs/design-system/componentes/login-screen.md#acessibilidade).
 * O botão fica fora do <label>, e uma região escondida anuncia o estado.
 */
type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "type"> & {
  id: string;
  label: ReactNode;
  help?: ReactNode;
  error?: string | null;
  autoComplete: "current-password" | "new-password";
  /** O formulário pede para esconder a senha antes de enviar. */
  forceHidden?: boolean;
};

export function PasswordField({
  id,
  label,
  help,
  error,
  className,
  forceHidden = false,
  ...props
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const shown = visible && !forceHidden;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-label text-tinta">
        {label}
      </label>
      <span className={cn(inputBoxClasses, "pr-1")}>
        <input
          id={id}
          type={shown ? "text" : "password"}
          className={inputClasses}
          spellCheck={false}
          autoCapitalize="none"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, help, error)}
          {...props}
        />
        <button
          type="button"
          aria-controls={id}
          onClick={() => setVisible((value) => !value)}
          className={cn(buttonClasses({ variant: "ghost" }), "min-h-11 flex-none")}
        >
          {shown ? (
            <EyeOff aria-hidden="true" className="size-5" strokeWidth={1.75} />
          ) : (
            <Eye aria-hidden="true" className="size-5" strokeWidth={1.75} />
          )}
          {shown ? "Ocultar" : "Mostrar"}
          <span className="md-sr"> senha</span>
        </button>
      </span>
      <span className="md-sr" aria-live="polite">
        {shown ? "Senha visível" : "Senha oculta"}
      </span>
      <FieldMessages id={id} help={help} error={error} />
    </div>
  );
}
