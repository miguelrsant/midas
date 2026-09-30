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
 * Senhas comuns com 8 caracteres ou mais (as mais curtas já caem pelo tamanho),
 * das listas públicas de senhas mais usadas no Brasil e no mundo. A lista completa
 * de vazamentos fica com o Have I Been Pwned. Comparação sem acento, sem espaço e
 * em minúsculas.
 */
const COMMON_PASSWORDS = new Set([
  "12345678",
  "123456789",
  "1234567890",
  "12345678910",
  "87654321",
  "987654321",
  "11223344",
  "12344321",
  "01020304",
  "10203040",
  "102030405060",
  "password",
  "password1",
  "password12",
  "password123",
  "passw0rd",
  "senha123",
  "senha1234",
  "senha12345",
  "senha123456",
  "minhasenha",
  "mudar123",
  "trocar123",
  "qwerty123",
  "qwertyuiop",
  "asdfghjkl",
  "zxcvbnm123",
  "1q2w3e4r",
  "1q2w3e4r5t",
  "q1w2e3r4",
  "q1w2e3r4t5",
  "abc12345",
  "abcd1234",
  "a1b2c3d4",
  "iloveyou",
  "iloveyou1",
  "euteamo",
  "euteamo123",
  "teamo123",
  "brasil123",
  "brasil2026",
  "flamengo",
  "flamengo123",
  "corinthians",
  "corinthians123",
  "palmeiras",
  "palmeiras123",
  "saopaulo",
  "vasco123",
  "gremio123",
  "internacional",
  "cruzeiro",
  "botafogo",
  "fluminense",
  "santos123",
  "princesa",
  "jesus123",
  "deusefiel",
  "sunshine",
  "football",
  "baseball",
  "superman",
  "batman123",
  "welcome1",
  "letmein1",
  "admin123",
  "administrator",
  "changeme",
  "trustno1",
  "qazwsxedc",
  "aa123456",
  "a123456789",
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
  if (COMMON_PASSWORDS.has(simple)) return "common";

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
  // SHA-1 aqui não guarda senha: é o formato que a API do HIBP exige, e o resumo
  // nunca é gravado. A senha é armazenada só com Argon2id (./password.ts).
  const digest = await crypto.subtle.digest(
    "SHA-1",
    new TextEncoder().encode(normalizePassword(password)),
  );
  const sha1 = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
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
