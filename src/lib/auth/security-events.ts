import "server-only";

import type { SecurityEventType } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { errorCode, log } from "@/lib/log";

/**
 * Trilha mínima de responsabilização (LGPD, art. 6º, X): quem (id), o quê e quando.
 * Sem IP, sem e-mail e sem conteúdo. Uma falha aqui não derruba a ação da pessoa.
 */
export async function recordSecurityEvent(userId: string, type: SecurityEventType) {
  try {
    await db.securityEvent.create({ data: { userId, type } });
  } catch (error) {
    log.error("security_event.failed", { code: errorCode(error) });
  }
}
