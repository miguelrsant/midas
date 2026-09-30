import { z } from "zod";

/** Validações de formulário que rodam no navegador e no servidor. */

export const EMAIL_MESSAGES = {
  empty: "Digite seu e-mail.",
  invalid: "Confira o e-mail. Ele precisa ter @ e o endereço, como nome@exemplo.com.br.",
} as const;

const emailSchema = z.email();

/** Tira só os espaços das pontas (nunca da senha) e confere o formato. */
export function checkEmail(raw: string): { email: string; error: string | null } {
  const email = raw.trim();
  if (!email) return { email, error: EMAIL_MESSAGES.empty };
  if (email.length > 254 || !emailSchema.safeParse(email).success)
    return { email, error: EMAIL_MESSAGES.invalid };
  return { email, error: null };
}
