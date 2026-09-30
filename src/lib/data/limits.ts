import "server-only";

import { db } from "@/lib/db";

/** Limites mensais por categoria de gasto (A012). */

export async function listLimits(userId: string): Promise<Map<string, number>> {
  const rows = await db.categoryLimit.findMany({
    where: { userId },
    select: { categoryId: true, amountCents: true },
  });
  return new Map(rows.map((r) => [r.categoryId, r.amountCents]));
}

export async function setLimit(userId: string, categoryId: string, amountCents: number) {
  await db.categoryLimit.upsert({
    where: { userId_categoryId: { userId, categoryId } },
    create: { userId, categoryId, amountCents },
    update: { amountCents },
  });
}

export async function removeLimit(userId: string, categoryId: string): Promise<boolean> {
  const deleted = await db.categoryLimit.deleteMany({ where: { userId, categoryId } });
  return deleted.count === 1;
}
