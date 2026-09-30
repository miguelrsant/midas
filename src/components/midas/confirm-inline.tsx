"use client";

import { Trash } from "lucide-react";
import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

/**
 * Confirmação destrutiva na própria tela (docs/design-system/componentes/button.md#perigo):
 * sem diálogo surpresa. O foco vai para "Manter"; Esc cancela e volta ao botão.
 */
export function ConfirmInline({
  trigger,
  question,
  confirmLabel,
  keepLabel,
  busy,
  busyLabel = "Excluindo…",
  onConfirm,
}: {
  trigger: string;
  question: string;
  confirmLabel: string;
  keepLabel: string;
  busy?: boolean;
  busyLabel?: string;
  onConfirm: () => void;
}) {
  const [open, setOpen] = useState(false);
  const keepRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const textId = useId();
  const wasOpen = useRef(false);

  useEffect(() => {
    if (open) keepRef.current?.focus();
    else if (wasOpen.current) triggerRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  const escape = (event: KeyboardEvent) => {
    if (event.key === "Escape") setOpen(false);
  };

  if (!open) {
    return (
      <Button
        ref={triggerRef}
        variant="danger"
        icon={<Trash aria-hidden="true" className="size-5" strokeWidth={1.75} />}
        onClick={() => setOpen(true)}
      >
        {trigger}
      </Button>
    );
  }
  return (
    <div
      role="group"
      aria-labelledby={textId}
      className="flex flex-col gap-3 rounded-md border border-gasto bg-superficie p-4"
    >
      <p id={textId} className="text-body text-tinta">
        {question}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          variant="danger"
          busy={busy}
          busyLabel={busyLabel}
          onClick={onConfirm}
          onKeyDown={escape}
        >
          {confirmLabel}
        </Button>
        <Button ref={keepRef} variant="secondary" onClick={() => setOpen(false)} onKeyDown={escape}>
          {keepLabel}
        </Button>
      </div>
    </div>
  );
}
