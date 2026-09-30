import { hash, verify } from "@node-rs/argon2";

import { normalizePassword } from "./password-rules";

/**
 * Hash de senha com Argon2id nos parâmetros mínimos recomendados pela OWASP
 * (Password Storage Cheat Sheet): m = 19 MiB, t = 2, p = 1.
 * O hash sai no formato PHC ($argon2id$v=19$m=...), com o sal junto.
 */
export const ARGON2_OPTIONS = {
  // Algorithm.Argon2id da @node-rs/argon2 (const enum, que não atravessa isolatedModules).
  algorithm: 2,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
} as const;

export async function hashPassword(password: string) {
  return hash(normalizePassword(password), ARGON2_OPTIONS);
}

export async function verifyPassword({
  hash: stored,
  password,
}: {
  hash: string;
  password: string;
}) {
  try {
    return await verify(stored, normalizePassword(password));
  } catch {
    // Hash corrompido ou em formato desconhecido: trata como senha errada.
    return false;
  }
}
