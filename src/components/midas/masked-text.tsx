import { Fragment } from "react";

/**
 * Frase com valores em reais que somem no modo discreto ("Ocultar valores"): cada
 * "R$ 1.234,56" vira "R$ •••••", como o componente Money. Para títulos e frases montadas
 * no servidor ("Março deve fechar com R$ 2.300 de sobra.").
 */
const MONEY = /(R\$[\s ]\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/g;

export function MaskedText({ text }: { text: string }) {
  const parts = text.split(MONEY);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <Fragment key={i}>
        <span className="md-valor">{part}</span>
        <span className="md-oculto">
          <span aria-hidden="true">R$&nbsp;•••••</span>
          <span className="md-sr">valor oculto</span>
        </span>
      </Fragment>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}
