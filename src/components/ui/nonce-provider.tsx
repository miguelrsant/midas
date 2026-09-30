"use client";

import { setNonce } from "get-nonce";

/**
 * Entrega o nonce da CSP às bibliotecas que criam <style> no navegador
 * (react-remove-scroll, usado pelo Dialog do Radix). Sem isso a CSP bloqueia
 * o estilo e a página rola por baixo do diálogo.
 */
export function NonceProvider({ nonce }: { nonce?: string }) {
  if (nonce && typeof window !== "undefined") setNonce(nonce);
  return null;
}
