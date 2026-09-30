import { PASSWORD_MESSAGES } from "./password-rules";

/**
 * Traduz os erros da API de autenticação para os textos fixos da interface
 * (docs/design-system/componentes/login-screen.md#conteúdo). Nunca mostre a
 * mensagem original: ela é em inglês e pode revelar detalhes.
 */

export const AUTH_MESSAGES = {
  invalidCredentials: "E-mail ou senha incorretos.",
  tooManyAttempts: "Muitas tentativas. Espere 1 hora e tente de novo.",
  network: "Não foi possível conectar. Confira a internet e tente de novo.",
  server: "Não deu para salvar agora. Tente de novo em alguns instantes.",
  emailNotVerified:
    "Falta confirmar seu e-mail. Enviamos um link novo para a sua caixa de entrada.",
  resetSent: "Se esse e-mail tiver conta no Midas, você vai receber um link em alguns minutos.",
  linkExpired: "Esse link venceu. Peça um novo.",
  wrongCurrentPassword: "A senha atual não confere.",
  sessionExpired: "Por segurança, sua sessão terminou. Entre de novo para continuar.",
} as const;

export type AuthErrorLike =
  { code?: string | undefined; status?: number | undefined } | null | undefined;

export function authErrorMessage(error: AuthErrorLike): string {
  if (!error) return AUTH_MESSAGES.server;
  if (error.status === 429) return AUTH_MESSAGES.tooManyAttempts;
  switch (error.code) {
    case "INVALID_EMAIL_OR_PASSWORD":
    case "INVALID_EMAIL":
    case "USER_NOT_FOUND":
    case "CREDENTIAL_ACCOUNT_NOT_FOUND":
      return AUTH_MESSAGES.invalidCredentials;
    case "EMAIL_NOT_VERIFIED":
      return AUTH_MESSAGES.emailNotVerified;
    case "INVALID_PASSWORD":
      return AUTH_MESSAGES.wrongCurrentPassword;
    case "PASSWORD_TOO_SHORT":
      return PASSWORD_MESSAGES["too-short"];
    case "PASSWORD_TOO_LONG":
      return PASSWORD_MESSAGES["too-long"];
    case "PASSWORD_COMMON":
      return PASSWORD_MESSAGES.common;
    case "PASSWORD_BREACHED":
      return PASSWORD_MESSAGES.breached;
    case "INVALID_TOKEN":
    case "TOKEN_EXPIRED":
      return AUTH_MESSAGES.linkExpired;
    default:
      return error.status === undefined || error.status === 0
        ? AUTH_MESSAGES.network
        : AUTH_MESSAGES.server;
  }
}
