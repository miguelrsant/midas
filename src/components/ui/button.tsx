import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

/** docs/design-system/componentes/button.md */

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const base =
  "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-md border px-6 " +
  "font-sans text-label transition-colors duration-(--duracao-rapida) ease-out " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco " +
  "disabled:cursor-not-allowed disabled:opacity-45 aria-busy:cursor-progress";

const variants: Record<ButtonVariant, string> = {
  primary: "border-transparent bg-primario text-sobre-primario hover:bg-primario-hover",
  secondary: "border-borda bg-superficie text-tinta hover:bg-superficie-funda",
  ghost: "border-transparent bg-transparent px-3 text-ouro-texto hover:bg-superficie-funda",
  danger: "border-gasto bg-superficie text-gasto hover:bg-gasto-fundo",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  fullWidth = false,
}: { variant?: ButtonVariant; size?: "md" | "lg"; fullWidth?: boolean } = {}) {
  return cn(
    base,
    variants[variant],
    size === "lg" ? "min-h-14 px-8 text-body font-semibold" : "min-h-12",
    fullWidth && "w-full",
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "md" | "lg";
  fullWidth?: boolean;
  /** Enquanto envia: mantém o foco no botão e evita novo envio. */
  busy?: boolean;
  icon?: ReactNode;
};

export function Button({
  variant,
  size,
  fullWidth,
  busy = false,
  icon,
  className,
  children,
  type = "button",
  onClick,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonClasses({ variant, size, fullWidth }), className)}
      aria-busy={busy || undefined}
      aria-disabled={busy || undefined}
      onClick={(event) => {
        if (busy) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
