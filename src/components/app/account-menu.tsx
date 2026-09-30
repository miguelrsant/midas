"use client";

/* eslint-disable @next/next/no-img-element -- símbolo da marca, servido do próprio app. */
import { LogOut, Settings, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/greeting";

const itemClasses =
  "flex min-h-12 w-full items-center gap-3 rounded-sm px-3 text-left text-label text-tinta hover:bg-superficie-funda " +
  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foco";

/**
 * Avatar com as iniciais e o menu da conta (docs/design-system/componentes/app-header.md).
 * Padrão de "disclosure": o botão abre uma lista de links; Esc e clique fora fecham e o foco volta ao avatar.
 */
export function AccountMenu({ nickname }: { nickname: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const letters = initials(nickname);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label="Sua conta"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "grid size-11 place-items-center rounded-pill font-display text-body tracking-[0.04em]",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco",
          letters
            ? "bg-mogno text-marmore hover:ring-2 hover:ring-borda hover:ring-inset dark:bg-ouro dark:text-sobre-ouro"
            : "bg-superficie-funda ring-1 ring-borda ring-inset",
        )}
      >
        {letters ? (
          <span aria-hidden="true">{letters}</span>
        ) : (
          <img src="/marca/midas-simbolo.svg" alt="" aria-hidden="true" className="size-6" />
        )}
      </button>

      <div
        id={menuId}
        hidden={!open}
        className="absolute right-0 z-30 mt-2 w-60 rounded-md border border-veio bg-superficie p-2 shadow-cartao"
      >
        <p className="truncate px-3 pt-1 pb-2 text-caption text-tinta-suave">{nickname}</p>
        <ul className="flex flex-col">
          <li>
            <Link href="/seus-dados" className={itemClasses} onClick={() => setOpen(false)}>
              <ShieldCheck
                aria-hidden="true"
                className="size-5 text-ouro-texto"
                strokeWidth={1.75}
              />
              Seus dados
            </Link>
          </li>
          <li>
            <Link href="/configuracoes" className={itemClasses} onClick={() => setOpen(false)}>
              <Settings aria-hidden="true" className="size-5 text-ouro-texto" strokeWidth={1.75} />
              Configurações
            </Link>
          </li>
          <li className="my-1 border-t border-veio" aria-hidden="true" />
          <li>
            <button
              type="button"
              className={itemClasses}
              aria-busy={leaving || undefined}
              onClick={async () => {
                if (leaving) return;
                setLeaving(true);
                await authClient.signOut();
                router.replace("/entrar");
                router.refresh();
              }}
            >
              <LogOut aria-hidden="true" className="size-5 text-ouro-texto" strokeWidth={1.75} />
              {leaving ? "Saindo…" : "Sair"}
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
