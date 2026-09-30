/**
 * Regras de senha: só tamanho, sem regras de composição (NIST SP 800-63B-4).
 * O mínimo é 8, o piso do NIST, por decisão do projeto: 15 afastava quem tem
 * dificuldade para digitar. A força vem da recusa de senhas comuns e vazadas e
 * do limite de tentativas no servidor (exceção registrada no CLAUDE.md).
 * Este arquivo roda no navegador e no servidor.
 */

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

/**
 * Normaliza a senha antes do hash (NIST SP 800-63B-4): NFKC, para que "é"
 * digitado de jeitos diferentes em aparelhos diferentes vire a mesma senha.
 */
export function normalizePassword(password: string) {
  return password.normalize("NFKC");
}

/** Tamanho em caracteres (pontos de código), não em unidades UTF-16: emoji conta 1. */
export function passwordLength(password: string) {
  return [...normalizePassword(password)].length;
}

export type PasswordProblem = "too-short" | "too-long" | "common" | "breached";

/** Textos da interface (docs/design-system/componentes/login-screen.md#conteúdo). */
export const PASSWORD_MESSAGES: Record<PasswordProblem, string> = {
  "too-short": `A senha precisa ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`,
  "too-long": `A senha pode ter no máximo ${PASSWORD_MAX_LENGTH} caracteres.`,
  common: "Essa senha é muito usada e fácil de adivinhar. Tente uma frase só sua.",
  breached:
    "Essa senha já apareceu em vazamentos de outros sites. Escolha outra, de preferência uma frase.",
};

/** "A senha precisa ter pelo menos 8 caracteres. Faltam 3." */
export function shortPasswordMessage(password: string) {
  const missing = PASSWORD_MIN_LENGTH - passwordLength(password);
  return `${PASSWORD_MESSAGES["too-short"]} Faltam ${missing}.`;
}
