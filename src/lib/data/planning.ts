import "server-only";

import { randomUUID } from "node:crypto";

import type { CalculatorKind } from "@/generated/prisma/client";
import { openText, sealText } from "@/lib/crypto/fields";
import { type DateOnly, fromDbDate, type MonthKey, toDbDate } from "@/lib/dates";
import { db } from "@/lib/db";
import type { LaborResult, PlannedPayment } from "@/lib/labor/types";

import { sealDescription } from "./entries";

/**
 * Contas das calculadoras e rendas previstas (A011, A014).
 * A conta guardada leva as respostas e o resultado cifrados; as rendas previstas são
 * valores e datas gerados pelo servidor, sem texto livre.
 */

const FIELD = "calculation.sealed";

export interface ExpectedIncomeView {
  id: string;
  categoryId: string;
  labelKey: string;
  amountCents: number;
  dueDate: DateOnly;
  calculationId: string | null;
}

export async function listExpectedIncomes(userId: string): Promise<ExpectedIncomeView[]> {
  const rows = await db.expectedIncome.findMany({
    where: { userId },
    orderBy: [{ dueDate: "asc" }, { labelKey: "asc" }],
    select: {
      id: true,
      categoryId: true,
      labelKey: true,
      amountCents: true,
      dueDate: true,
      calculationId: true,
    },
  });
  return rows.map((r) => ({ ...r, dueDate: fromDbDate(r.dueDate) }));
}

export interface StoredCalculation {
  input: unknown;
  result: LaborResult;
  engineVersion: number;
}

export interface CalculationView {
  id: string;
  kind: CalculatorKind;
  createdAt: Date;
  data: StoredCalculation | null;
}

/** Contas de calculadora; `take` limita a lista da tela, a exportação pega todas. */
export async function listCalculations(
  userId: string,
  { take }: { take?: number } = {},
): Promise<CalculationView[]> {
  const rows = await db.calculation.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
    select: { id: true, kind: true, createdAt: true, sealed: true },
  });
  return rows.map((r) => {
    let data: StoredCalculation | null = null;
    try {
      data = JSON.parse(
        openText(r.sealed, { field: FIELD, userId, rowId: r.id }),
      ) as StoredCalculation;
    } catch {
      data = null;
    }
    return { id: r.id, kind: r.kind, createdAt: r.createdAt, data };
  });
}

/**
 * Guarda a conta e cria as rendas previstas, numa transação. Idempotente pelo id
 * gerado no aparelho: adicionar duas vezes não duplica.
 */
export async function addCalculationToPlan(
  userId: string,
  id: string,
  kind: CalculatorKind,
  stored: StoredCalculation,
  payments: readonly PlannedPayment[],
): Promise<"created" | "replayed" | "conflict"> {
  const existing = await db.calculation.findUnique({ where: { id }, select: { userId: true } });
  if (existing) return existing.userId === userId ? "replayed" : "conflict";
  await db.$transaction([
    db.calculation.create({
      data: {
        id,
        userId,
        kind,
        sealed: sealText(JSON.stringify(stored), { field: FIELD, userId, rowId: id }),
      },
    }),
    db.expectedIncome.createMany({
      data: payments.map((p) => ({
        id: randomUUID(),
        userId,
        calculationId: id,
        categoryId: p.categoryId,
        labelKey: p.labelKey,
        amountCents: p.cents,
        dueDate: toDbDate(p.dueDate),
      })),
    }),
  ]);
  return "created";
}

export async function deleteCalculation(userId: string, id: string): Promise<boolean> {
  const deleted = await db.calculation.deleteMany({ where: { id, userId } });
  return deleted.count === 1;
}

/**
 * "Recebi": vira lançamento de verdade (valor e data confirmados) e a prevista some.
 * Numa transação, com a contagem conferida: dois toques não criam dois lançamentos.
 */
export async function receiveExpectedIncome(
  userId: string,
  expectedId: string,
  entryId: string,
  input: { amountCents: number; date: DateOnly; description: string },
): Promise<boolean> {
  return db.$transaction(async (tx) => {
    const expected = await tx.expectedIncome.findFirst({
      where: { id: expectedId, userId },
      select: { categoryId: true },
    });
    if (!expected) return false;
    const removed = await tx.expectedIncome.deleteMany({ where: { id: expectedId, userId } });
    if (removed.count !== 1) return false;
    await createEntryInTx(tx, userId, entryId, {
      kind: "income",
      amountCents: input.amountCents,
      categoryId: expected.categoryId,
      description: input.description,
      date: input.date,
    });
    return true;
  });
}

async function createEntryInTx(
  tx: Parameters<Parameters<typeof db.$transaction>[0]>[0],
  userId: string,
  id: string,
  input: {
    kind: "income";
    amountCents: number;
    categoryId: string;
    description: string;
    date: DateOnly;
  },
) {
  await tx.entry.create({
    data: {
      id,
      userId,
      kind: "INCOME",
      amountCents: input.amountCents,
      categoryId: input.categoryId,
      description: sealDescription(userId, id, input.description),
      date: toDbDate(input.date),
    },
  });
}

export async function dismissExpectedIncome(userId: string, id: string): Promise<boolean> {
  const deleted = await db.expectedIncome.deleteMany({ where: { id, userId } });
  return deleted.count === 1;
}

export async function lastSummaryOpened(userId: string): Promise<MonthKey | null> {
  const row = await db.userPreference.findUnique({
    where: { userId },
    select: { lastSummaryOpenedMonth: true },
  });
  return row?.lastSummaryOpenedMonth ?? null;
}

export async function markSummaryOpened(userId: string, month: MonthKey) {
  const current = await lastSummaryOpened(userId);
  if (current && current >= month) return;
  await db.userPreference.upsert({
    where: { userId },
    create: { userId, lastSummaryOpenedMonth: month },
    update: { lastSummaryOpenedMonth: month },
  });
}
