import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import type { ReactNode } from "react";

import { GoldenTouchProvider } from "@/components/midas/golden-touch";
import { DiscreetModeScript } from "@/components/midas/discreet-mode";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { NonceProvider } from "@/components/ui/nonce-provider";

import { atkinson, atkinsonMono, cormorant } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Midas", template: "%s · Midas" },
  description: "Suas finanças, seu controle. Anote o que entrou e o que saiu e veja quanto sobrou.",
  applicationName: "Midas",
  icons: {
    icon: [{ url: "/marca/midas-favicon.svg", type: "image/svg+xml" }],
    apple: "/marca/midas-icone-app.png",
  },
  // Área logada e dados pessoais: nada de indexação.
  robots: { index: false, follow: false },
  referrer: "strict-origin-when-cross-origin",
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  // Cor da barra do navegador no tema padrão (claro).
  themeColor: "#f5f2ec",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // O nonce da CSP vem do src/proxy.ts; o next-themes precisa dele para o script que evita o piscar do tema.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${atkinson.variable} ${atkinsonMono.variable} ${cormorant.variable}`}
    >
      <head>
        <link
          rel="preload"
          href="/fontes/marcellus-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin=""
        />
      </head>
      <body className="min-h-dvh bg-marmore text-tinta antialiased">
        {/* Invisível até receber foco pelo teclado (WCAG 2.4.1). */}
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-superficie focus:p-3 focus:text-label focus:text-tinta focus:shadow-cartao"
        >
          Pular para o conteúdo
        </a>
        <DiscreetModeScript nonce={nonce} />
        <NonceProvider nonce={nonce} />
        <ThemeProvider nonce={nonce}>
          <GoldenTouchProvider>{children}</GoldenTouchProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
