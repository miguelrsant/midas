"use client";

import { setNonce } from "get-nonce";

/**
 * Nonce que vale na página aberta. Numa navegação sem recarga, o layout raiz é
 * renderizado de novo com o nonce de outra requisição, mas a CSP que vale é a do
 * documento: por isso, no navegador, lemos o nonce de um <script> da própria página.
 */
export function documentNonce(fallback?: string) {
  if (typeof document === "undefined") return fallback;
  const script = document.querySelector<HTMLScriptElement>("script[nonce]");
  return script?.nonce || fallback;
}

/**
 * Entrega o nonce às bibliotecas que criam <style> no navegador (react-remove-scroll,
 * usado pelo Dialog do Radix). Sem isso a CSP bloqueia o estilo.
 */
export function NonceProvider({ nonce }: { nonce?: string }) {
  const value = documentNonce(nonce);
  if (value && typeof window !== "undefined") setNonce(value);
  return null;
}
