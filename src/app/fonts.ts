import {
  Atkinson_Hyperlegible_Mono,
  Atkinson_Hyperlegible_Next,
  Cormorant_Garamond,
} from "next/font/google";

// O next/font baixa as fontes no build e as serve do próprio domínio:
// nenhuma visita chama o Google (veja docs/design-system/05-tipografia.md).

export const atkinson = Atkinson_Hyperlegible_Next({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-atkinson",
});

export const atkinsonMono = Atkinson_Hyperlegible_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-atkinson-mono",
});

export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cormorant",
});
