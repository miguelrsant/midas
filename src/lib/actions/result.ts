/**
 * Resultado das Server Actions do Midas, igual no cliente e no servidor.
 * Mensagens em português simples (docs/design-system/11-conteudo-e-tom.md#erros),
 * nunca com códigos de erro nem com o que a pessoa digitou.
 */

export type FailureCode =
  "invalid" | "not_found" | "session_expired" | "too_many" | "wrong_password" | "limit" | "server";

export type ActionFailure = {
  ok: false;
  code: FailureCode;
  message: string;
  /** Mensagem por campo, só em "invalid". */
  fields?: Record<string, string>;
};

export type ActionResult<T = null> = { ok: true; data: T } | ActionFailure;

export const ACTION_MESSAGES: Record<FailureCode, string> = {
  invalid: "Confira os campos marcados.",
  not_found: "Não achamos esse item. Ele pode ter sido apagado.",
  session_expired: "Por segurança, sua sessão terminou. Entre de novo para continuar.",
  too_many: "Muitas tentativas. Tente de novo mais tarde.",
  wrong_password: "Senha incorreta.",
  limit: "Você chegou ao máximo permitido.",
  server: "Não deu para salvar agora. Tente de novo em alguns instantes.",
};

export function fail(code: FailureCode, message = ACTION_MESSAGES[code]): ActionFailure {
  return { ok: false, code, message };
}

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}
