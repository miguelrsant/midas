import { z } from "zod";

/** Validações de formulário que rodam no navegador e no servidor. */

export const EMAIL_MESSAGES = {
  empty: "Digite seu e-mail.",
  invalid: "Confira o e-mail. Ele precisa ter @ e o endereço, como nome@exemplo.com.br.",
} as const;

const emailSchema = z.email();

export const NICKNAME_MAX_LENGTH = 40;

export const NICKNAME_MESSAGES = {
  empty: "Digite seu nome ou apelido.",
  tooLong: `Use no máximo ${NICKNAME_MAX_LENGTH} caracteres.`,
} as const;

/** Nome ou apelido para a saudação: obrigatório, até 40 caracteres, sem espaços nas pontas. */
export function checkNickname(raw: string): { nickname: string; error: string | null } {
  const nickname = raw.trim().replace(/\s+/g, " ");
  if (!nickname) return { nickname, error: NICKNAME_MESSAGES.empty };
  if ([...nickname].length > NICKNAME_MAX_LENGTH)
    return { nickname, error: NICKNAME_MESSAGES.tooLong };
  return { nickname, error: null };
}

/** Tira só os espaços das pontas (nunca da senha) e confere o formato. */
export function checkEmail(raw: string): { email: string; error: string | null } {
  const email = raw.trim();
  if (!email) return { email, error: EMAIL_MESSAGES.empty };
  if (email.length > 254 || !emailSchema.safeParse(email).success)
    return { email, error: EMAIL_MESSAGES.invalid };
  return { email, error: null };
}
