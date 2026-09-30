import "server-only";

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

import { env } from "@/lib/env";

/**
 * Criptografia do texto livre (.lgpd/encryption.md, G17).
 *
 * AES-256-GCM com IV aleatório. O dado associado (AAD) amarra a cifra à tabela, à
 * coluna, à pessoa e à linha: uma cifra copiada para outro lugar não abre.
 * Formato: "v1.<kid>.<iv>.<cifra+tag>", em base64url.
 */

export type FieldRef = {
  /** "entry.description" */
  field: string;
  userId: string;
  rowId: string;
};

type Keyring = { current: string; keys: Map<string, Buffer> };

function parseKeyring(spec: string, currentId: string): Keyring {
  const keys = new Map<string, Buffer>();
  for (const entry of spec.split(",")) {
    const [kid, value] = entry.split(":");
    if (!kid || !value) continue;
    const key = Buffer.from(value, "base64");
    if (key.length !== 32) throw new Error("Chave de cifra precisa de 32 bytes");
    keys.set(kid, key);
  }
  if (!keys.has(currentId)) throw new Error("Chave atual ausente");
  return { current: currentId, keys };
}

let keyring: Keyring | null = null;
function getKeyring(): Keyring {
  keyring ??= parseKeyring(env.DATA_ENCRYPTION_KEYS, env.DATA_ENCRYPTION_KEY_ID);
  return keyring;
}

/** Só para testes: troca as chaves. */
export function setKeyringForTests(spec: string, currentId: string) {
  keyring = parseKeyring(spec, currentId);
}

function aad(ref: FieldRef) {
  return Buffer.from(`midas|${ref.field}|${ref.userId}|${ref.rowId}`, "utf8");
}

export function sealText(plain: string, ref: FieldRef): string {
  const { current, keys } = getKeyring();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keys.get(current)!, iv);
  cipher.setAAD(aad(ref));
  const body = Buffer.concat([cipher.update(plain, "utf8"), cipher.final(), cipher.getAuthTag()]);
  return `v1.${current}.${iv.toString("base64url")}.${body.toString("base64url")}`;
}

export class SealedTextError extends Error {
  override name = "SealedTextError";
}

export function openText(sealed: string, ref: FieldRef): string {
  const parts = sealed.split(".");
  if (parts.length !== 4 || parts[0] !== "v1") throw new SealedTextError("formato");
  const [, kid, ivText, bodyText] = parts as [string, string, string, string];
  const key = getKeyring().keys.get(kid);
  if (!key) throw new SealedTextError("chave");
  const iv = Buffer.from(ivText, "base64url");
  const body = Buffer.from(bodyText, "base64url");
  if (iv.length !== 12 || body.length < 16) throw new SealedTextError("formato");
  try {
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAAD(aad(ref));
    decipher.setAuthTag(body.subarray(body.length - 16));
    return Buffer.concat([
      decipher.update(body.subarray(0, body.length - 16)),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    throw new SealedTextError("autenticação");
  }
}

/** Abre sem lançar: devolve null se a cifra não abrir (a tela mostra o nome da categoria). */
export function tryOpenText(sealed: string | null, ref: FieldRef): string | null {
  if (sealed === null) return null;
  try {
    return openText(sealed, ref);
  } catch {
    return null;
  }
}

export function sealOptional(plain: string | null | undefined, ref: FieldRef): string | null {
  return plain ? sealText(plain, ref) : null;
}

/** Diz se a cifra usa uma chave diferente da atual (para o script de rotação). */
export function needsReseal(sealed: string): boolean {
  return sealed.split(".")[1] !== getKeyring().current;
}
