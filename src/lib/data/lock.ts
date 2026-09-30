import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";

export type Tx = Prisma.TransactionClient;

/**
 * Transação com uma trava por pessoa (pg_advisory_xact_lock): contar e criar ficam
 * juntos, então tetos como 30 categorias e 100 fixos valem mesmo com requisições
 * ao mesmo tempo. A trava some no fim da transação.
 */
export function withUserLock<T>(userId: string, run: (tx: Tx) => Promise<T>): Promise<T> {
  return db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`midas:user:${userId}`}))`;
    return run(tx);
  });
}
