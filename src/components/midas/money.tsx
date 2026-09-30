import { cn } from "@/lib/cn";
import type { EntryKind } from "@/lib/entry";
import { formatMoney, formatWholeMoney, MINUS, NBSP } from "@/lib/money";

/**
 * Valor em reais (docs/design-system/11-conteudo-e-tom.md#dinheiro): sinal visual escondido do
 * leitor de tela, que ouve "Entrou" ou "Saiu". No modo discreto vira "R$ •••••" e o leitor
 * ouve "valor oculto".
 */
export function Money({
  cents,
  kind,
  whole = false,
  approx = false,
  className,
}: {
  cents: number;
  /** Com tipo: "+ R$" em renda, "− R$" em gasto, e a cor da série. */
  kind?: EntryKind;
  /** Arredondado ao real, para frases. */
  whole?: boolean;
  /** "cerca de", para estimativas. */
  approx?: boolean;
  className?: string;
}) {
  const abs = Math.abs(cents);
  const text = whole ? formatWholeMoney(abs) : formatMoney(abs, { sign: "never" });
  const negative = !kind && cents < 0;
  const sign = kind === "income" ? "+" : kind === "expense" || negative ? MINUS : null;
  const srPrefix =
    kind === "income" ? "Entrou " : kind === "expense" ? "Saiu " : negative ? "menos " : "";
  return (
    <span
      className={cn(
        "whitespace-nowrap tabular-nums",
        kind === "income" && "text-renda",
        kind === "expense" && "text-gasto",
        className,
      )}
    >
      <span className="md-valor">
        {approx ? <span className="md-sr">cerca de </span> : null}
        {srPrefix ? <span className="md-sr">{srPrefix}</span> : null}
        {sign && abs > 0 ? <span aria-hidden="true">{`${sign}${NBSP}`}</span> : null}
        {text}
      </span>
      <span className="md-oculto">
        <span aria-hidden="true">{`R$${NBSP}•••••`}</span>
        <span className="md-sr">valor oculto</span>
      </span>
    </span>
  );
}
