import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MaskedText } from "./masked-text";

const html = (text: string) => renderToStaticMarkup(createElement(MaskedText, { text }));

describe("frase com valores ocultáveis", () => {
  it("cada valor em reais ganha a versão oculta", () => {
    const out = html("Março deve fechar com R$ 2.300 de sobra.");
    expect(out).toContain('<span class="md-valor">R$ 2.300</span>');
    expect(out).toContain("md-oculto");
    expect(out.startsWith("Março deve fechar com ")).toBe(true);
    expect(out.endsWith(" de sobra.")).toBe(true);
  });

  it("valores com centavos e vários na mesma frase", () => {
    const out = html("R$ 1.799,39 no dia 20 e R$ 2.699,10 no dia 5.");
    expect(out.match(/md-valor/g)).toHaveLength(2);
    expect(out).toContain("R$ 2.699,10");
  });

  it("frase sem valor fica igual", () => {
    expect(html("Outubro vai bem.")).toBe("Outubro vai bem.");
  });
});
