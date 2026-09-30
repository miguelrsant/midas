import "server-only";

import { createHmac } from "node:crypto";

import { db } from "@/lib/db";
import { env } from "@/lib/env";

/**
 * Contadores com janela fixa, guardados na tabela `throttle`. Completam o limite por
 * IP do Better Auth onde ele não basta: tentativas de entrada por conta (ataque de
 * muitos IPs contra um e-mail) e envio de e-mails (cota diária do remetente).
 * Mapa de dados: .lgpd/data-map.md (A006).
 */

/**
 * Chave sem dado pessoal em claro: HMAC-SHA256 com o segredo do servidor. Sem o
 * segredo, uma cópia do banco não revela nem permite testar quais e-mails estão ali.
 */
export function hashKey(value: string): string {
  return createHmac("sha256", env.BETTER_AUTH_SECRET)
    .update(`throttle:${value}`)
    .digest("base64url");
}

/** Chave de um e-mail: minúsculo e sem espaços nas pontas, como o Better Auth guarda. */
export function emailKey(prefix: string, email: string): string {
  return `${prefix}:${hashKey(email.trim().toLowerCase())}`;
}

/**
 * Soma uma tentativa e diz se ela ainda cabe no limite. Atômico: duas requisições ao
 * mesmo tempo nunca leem o mesmo contador. Quando a janela vence, a contagem recomeça.
 */
export async function consume(
  key: string,
  { windowMs, max }: { windowMs: number; max: number },
): Promise<boolean> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + windowMs);
  const rows = await db.$queryRaw<Array<{ count: number }>>`
    INSERT INTO "throttle" ("key", "count", "expiresAt")
    VALUES (${key}, 1, ${expiresAt})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "throttle"."expiresAt" <= ${now} THEN 1 ELSE "throttle"."count" + 1 END,
      "expiresAt" = CASE WHEN "throttle"."expiresAt" <= ${now} THEN EXCLUDED."expiresAt" ELSE "throttle"."expiresAt" END
    RETURNING "count"`;
  return (rows[0]?.count ?? Infinity) <= max;
}
