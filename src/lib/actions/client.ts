"use client";

import { type ActionResult, fail } from "./result";

/**
 * Chama uma Server Action no cliente. Se a chamada lançar (sem internet, deploy
 * novo, servidor fora), devolve a falha genérica: a tela mantém o que foi digitado.
 */
export async function runAction<T>(call: () => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    return await call();
  } catch {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return fail(
        "server",
        "Sem conexão agora. O que você digitou continua aqui; tente salvar de novo.",
      );
    }
    return fail("server");
  }
}

/** Endereço da entrada que volta para a tela atual depois (sessão vencida). */
export function signInHref() {
  const back = window.location.pathname + window.location.search;
  return `/entrar?sessao=expirada&de=${encodeURIComponent(back)}`;
}
