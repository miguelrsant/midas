import { DiscreetToggle } from "./discreet-toggle";

/**
 * Modo discreto ("Ocultar valores", docs/design-system/16-privacidade-na-interface.md#modo-discreto-padrão-recomendado):
 * a escolha fica só no aparelho (localStorage) e liga `data-discreto` no <html> antes
 * da primeira pintura, para os valores nunca piscarem na tela.
 */
const SCRIPT = `try{if(localStorage.getItem("midas.discreto")==="1")document.documentElement.setAttribute("data-discreto","")}catch(e){}`;

export function DiscreetModeScript({ nonce }: { nonce?: string }) {
  return <script nonce={nonce} dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}

export { DiscreetToggle };
