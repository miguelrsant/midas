"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { documentNonce } from "@/components/ui/nonce-provider";

/**
 * O tema claro (Calacatta) é o padrão; escuro e automático são escolhas em Configurações.
 * Telas de entrada ficam sempre no claro, qualquer que seja a escolha.
 */
const LIGHT_ONLY_PATHS = [
  "/entrar",
  "/criar-conta",
  "/confirmar-email",
  "/recuperar-senha",
  "/redefinir-senha",
];

export function ThemeProvider({ children, nonce }: { children: ReactNode; nonce?: string }) {
  const pathname = usePathname();
  const lightOnly = LIGHT_ONLY_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
      forcedTheme={lightOnly ? "light" : undefined}
      nonce={documentNonce(nonce)}
    >
      {children}
    </NextThemesProvider>
  );
}
