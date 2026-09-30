import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/cn";

/** docs/design-system/componentes/button.md (base shadcn/ui: cva + Slot para asChild). */

export const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-md border px-6 " +
    "font-sans text-label transition-colors duration-(--duracao-rapida) ease-out " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco " +
    "disabled:cursor-not-allowed disabled:opacity-45 aria-busy:cursor-progress",
  {
    variants: {
      variant: {
        primary: "border-transparent bg-primario text-sobre-primario hover:bg-primario-hover",
        secondary: "border-borda bg-superficie text-tinta hover:bg-superficie-funda",
        ghost: "border-transparent bg-transparent px-3 text-ouro-texto hover:bg-superficie-funda",
        danger: "border-gasto bg-superficie text-gasto hover:bg-gasto-fundo",
      },
      size: {
        md: "min-h-12",
        lg: "min-h-14 px-8 text-body font-semibold",
        sm: "min-h-11 px-4",
      },
      fullWidth: { true: "w-full", false: "" },
    },
    defaultVariants: { variant: "primary", size: "md", fullWidth: false },
  },
);

export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;

/** Classes do botão, para dar a um <Link> a aparência de botão. */
export function buttonClasses(options: VariantProps<typeof buttonVariants> = {}) {
  return buttonVariants(options);
}

type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    /** Vira o elemento filho (um <Link>, por exemplo), como no shadcn/ui. */
    asChild?: boolean;
    /** Enquanto envia: mantém o foco no botão e evita novo envio. */
    busy?: boolean;
    /** Texto enquanto envia ("Salvando…"). Sem girador; a opacidade não muda. */
    busyLabel?: string;
    icon?: ReactNode;
  };

export function Button({
  variant,
  size,
  fullWidth,
  asChild = false,
  busy = false,
  busyLabel,
  icon,
  className,
  children,
  type = "button",
  onClick,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size, fullWidth }), className);
  if (asChild) {
    return (
      <Slot.Root className={classes} {...props}>
        {children}
      </Slot.Root>
    );
  }
  return (
    <button
      type={type}
      className={classes}
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
      {busy && busyLabel ? busyLabel : children}
    </button>
  );
}
