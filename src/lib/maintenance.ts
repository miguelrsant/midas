import "server-only";

import { db } from "@/lib/db";
import { errorCode, log } from "@/lib/log";

/**
 * Limpeza dos dados vencidos, sem cron nem fila: roda em segundo plano depois de
 * entradas e cadastros, no máximo uma vez por hora em cada instância do servidor.
 * Também pode ser rodada à mão com `pnpm db:limpeza`.
 * Prazos: .lgpd/retention.md (LGPD, arts. 15 e 16: eliminação ao fim do tratamento).
 */

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/** Contas que não confirmaram o e-mail somem depois deste prazo. */
export const UNVERIFIED_ACCOUNT_TTL_MS = 7 * DAY_MS;
/** Contadores de tentativas: a maior janela é de 1 hora; guardamos no máximo 1 dia. */
export const RATE_LIMIT_TTL_MS = DAY_MS;

export async function purgeExpiredData(now = new Date()) {
  const [sessions, verifications, rateLimits, throttles, unverifiedUsers] = await db.$transaction([
    db.session.deleteMany({ where: { expiresAt: { lt: now } } }),
    db.verification.deleteMany({ where: { expiresAt: { lt: now } } }),
    db.rateLimit.deleteMany({
      where: { lastRequest: { lt: BigInt(now.getTime() - RATE_LIMIT_TTL_MS) } },
    }),
    db.throttle.deleteMany({ where: { expiresAt: { lt: now } } }),
    db.user.deleteMany({
      where: {
        emailVerified: false,
        createdAt: { lt: new Date(now.getTime() - UNVERIFIED_ACCOUNT_TTL_MS) },
      },
    }),
  ]);
  return {
    sessions: sessions.count,
    verifications: verifications.count,
    rateLimits: rateLimits.count + throttles.count,
    unverifiedUsers: unverifiedUsers.count,
  };
}

let lastRun = 0;

/** Roda a limpeza se a última execução nesta instância tiver mais de 1 hora. */
export async function maybePurgeExpiredData() {
  const now = Date.now();
  if (now - lastRun < HOUR_MS) return;
  lastRun = now;
  try {
    const result = await purgeExpiredData(new Date(now));
    const total = Object.values(result).reduce((sum, count) => sum + count, 0);
    log.info("maintenance.purged", { count: total, durationMs: Date.now() - now });
  } catch (error) {
    lastRun = 0;
    log.error("maintenance.failed", { code: errorCode(error) });
  }
}
