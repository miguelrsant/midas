"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

import { isCurrent, NAV_ITEMS } from "./nav-items";

/**
 * Navegação inferior do celular: fixa, quatro destinos, sempre com ícone e texto.
 * 64px + a área segura do aparelho. Some a partir de 1024px, quando a navegação sobe para o topo.
 */
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-veio bg-superficie pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="mx-auto flex h-16 max-w-180 items-stretch justify-around px-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const current = isCurrent(pathname, href);
          return (
            <li key={href} className="flex min-w-14">
              <Link
                href={href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  // Cada item ocupa a largura do próprio texto, para nenhum rótulo ser cortado;
                  // abaixo de 360px o peso cai para 400 e tudo cabe em 14px.
                  "relative flex flex-1 flex-col items-center justify-center gap-1 px-1 text-caption font-semibold whitespace-nowrap max-[359px]:font-normal",
                  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foco",
                  current ? "text-tinta" : "text-tinta-suave hover:text-tinta",
                )}
              >
                {current ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-4 top-0 h-[3px] rounded-b-sm bg-ouro"
                  />
                ) : null}
                <Icon aria-hidden="true" className="size-6" strokeWidth={1.75} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** A partir de 1024px: links de texto no topo, entre o logo e a conta. */
export function TopNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Principal" className="hidden lg:block">
      <ul className="flex items-center gap-1">
        {NAV_ITEMS.map(({ href, label }) => {
          const current = isCurrent(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "relative inline-flex min-h-11 items-center rounded-md px-3 text-label",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco",
                  current
                    ? "text-tinta"
                    : "text-tinta-suave hover:bg-superficie-funda hover:text-tinta",
                )}
              >
                {label}
                {current ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3 bottom-1 h-[3px] rounded-sm bg-ouro"
                  />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
