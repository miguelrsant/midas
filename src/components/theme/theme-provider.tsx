"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Telas de entrada ficam sempre no tema claro (Calacatta), qualquer que seja o aparelho. */
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
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      forcedTheme={lightOnly ? "light" : undefined}
      nonce={nonce}
    >
      {children}
    </NextThemesProvider>
  );
}
