import { createHash } from "node:crypto";

import { errorCode, log } from "@/lib/log";

import {
  normalizePassword,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  passwordLength,
  type PasswordProblem,
} from "./password-rules";

/**
 * Checagens de senha além do tamanho (NIST SP 800-63B-4, 3.1.1.2):
 * recusa senhas comuns, previsíveis, com palavras do contexto (o nome do serviço)
 * e senhas que aparecem em vazamentos.
 */

/**
 * Senhas comuns com 15 caracteres ou mais (as curtas já caem pelo tamanho).
 * Comparação sem acento, sem espaço e em minúsculas.
 */
const COMMON_LONG_PASSWORDS = new Set([
  "123456789012345",
  "1234567890123456",
  "12345678901234567890",
  "123456789123456789",
  "098765432109876",
  "qwertyuiopasdfg",
  "qwertyuiopasdfghjkl",
  "qwertyuiopasdfghjklzxcvbnm",
  "qwertyuiop123456",
  "qwerty123456789",
  "1qaz2wsx3edc4rfv",
  "1q2w3e4r5t6y7u8i",
  "abcdefghijklmnop",
  "abcdefghijklmnopqrstuvwxyz",
  "passwordpassword",
  "password123456789",
  "password12345678",
  "senhasenhasenha",
  "minhasenhasecreta",
  "minhasenhaforte",
  "minhasenha12345",
  "senhaforte12345",
  "senha1234567890",
  "iloveyouiloveyou",
  "euteamoeuteamo",
  "euteamomuito123",
  "brasilbrasilbrasil",
  "flamengoflamengo",
  "corinthianscorinthians",
  "palmeiraspalmeiras",
  "letmeinletmein",
  "welcomewelcome",
  "trustno1trustno1",
  "correcthorsebatterystaple",
  "senhadomidas123",
]);

/** Palavras do contexto do serviço (NIST: context-specific words). */
const CONTEXT_WORDS = ["midas"];

function simplify(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, "")
    .toLowerCase();
}

export function checkPasswordLocally(password: string): PasswordProblem | null {
  const length = passwordLength(password);
  if (length < PASSWORD_MIN_LENGTH) return "too-short";
  if (length > PASSWORD_MAX_LENGTH) return "too-long";

  const simple = simplify(password);
  if (COMMON_LONG_PASSWORDS.has(simple)) return "common";

  // Um caractere repetido ("aaaaaaaaaaaaaaa") ou um bloco curto repetido ("abcabcabcabcabc").
  if (/^(.{1,4})\1+$/u.test(simple)) return "common";

  // Nome do serviço com enfeites ("midasmidas12345").
  for (const word of CONTEXT_WORDS) {
    const withoutWord = simple.replaceAll(word, "");
    if (withoutWord.length < simple.length && /^[\d\W_]*$/u.test(withoutWord)) return "common";
  }

  return null;
}

/**
 * Consulta o Have I Been Pwned por k-anonimato: só os 5 primeiros caracteres do
 * SHA-1 saem do servidor, e a resposta vem com preenchimento (Add-Padding) para
 * não revelar nada pelo tamanho. Se o serviço não responder em 2 segundos,
 * a checagem é pulada (o cadastro não pode depender de terceiros), e isso fica no log.
 */
export async function isPasswordBreached(password: string, fetchImpl: typeof fetch = fetch) {
  const sha1 = createHash("sha1").update(normalizePassword(password)).digest("hex").toUpperCase();
  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);

  try {
    const response = await fetchImpl(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { "Add-Padding": "true", "User-Agent": "Midas-password-check" },
      signal: AbortSignal.timeout(2_000),
      cache: "no-store",
    });
    if (!response.ok) {
      log.warn("password.breach_check_unavailable", { status: response.status });
      return false;
    }
    const body = await response.text();
    for (const line of body.split(/\r?\n/)) {
      const [candidate, count] = line.split(":");
      if (candidate?.trim() === suffix && Number(count) > 0) return true;
    }
    return false;
  } catch (error) {
    log.warn("password.breach_check_unavailable", { code: errorCode(error) });
    return false;
  }
}
