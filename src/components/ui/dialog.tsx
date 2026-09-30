"use client";

import { X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * Diálogo do shadcn/ui com os tokens do Midas (docs/design-system/06-espaco-e-forma.md#elevação).
 * O Radix trava a rolagem com react-remove-scroll, que injeta uma tag <style>: o nonce da
 * CSP é passado em NonceProvider (src/components/ui/nonce-provider.tsx).
 */

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & { children: ReactNode }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[rgb(23_17_12/0.55)]" />
      <DialogPrimitive.Content
        className={cn(
          "fixed top-1/2 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-100 -translate-x-1/2 -translate-y-1/2 flex-col gap-4",
          "rounded-lg bg-superficie p-6 text-tinta shadow-cartao focus:outline-none",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          aria-label="Fechar"
          className="absolute top-2 right-2 inline-flex size-12 items-center justify-center rounded-md text-tinta hover:bg-superficie-funda focus-visible:outline-2 focus-visible:outline-foco"
        >
          <X aria-hidden="true" className="size-5" strokeWidth={1.75} />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title className={cn("pr-10 text-title text-tinta", className)} {...props} />
  );
}

export function DialogDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-body text-tinta-suave", className)}
      {...props}
    />
  );
}
