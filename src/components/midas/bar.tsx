import { cn } from "@/lib/cn";

/**
 * Barra fina de proporção (docs/design-system/componentes/bar.md). Decorativa: a frase
 * ao lado leva a informação. A largura vem de uma classe pronta (w-[N%], gerada no
 * globals.css), nunca de style="" (a CSP bloqueia).
 */
const TONES = {
  ouro: "bg-ouro",
  alerta: "bg-alerta",
  gasto: "bg-gasto",
  renda: "bg-renda",
} as const;

export function pctClass(percent: number) {
  const n = Math.max(0, Math.min(100, Math.floor(Number.isFinite(percent) ? percent : 0)));
  return `w-[${n}%]`;
}

export function Bar({
  percent,
  tone = "ouro",
  className,
}: {
  percent: number;
  tone?: keyof typeof TONES;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("h-2 w-full overflow-hidden rounded-pill bg-superficie-funda", className)}
    >
      <div className={cn("h-full rounded-pill", TONES[tone], pctClass(percent))} />
    </div>
  );
}
