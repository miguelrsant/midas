import "server-only";

import { randomUUID } from "node:crypto";

import { cache } from "react";

import { Prisma } from "@/generated/prisma/client";
import { sealOptional, tryOpenText } from "@/lib/crypto/fields";
import { type DateOnly, fromDbDate, type MonthKey, toDbDate } from "@/lib/dates";
import { db } from "@/lib/db";
import { type EntryKind, fromDbKind, toDbKind } from "@/lib/entry";
import {
  dueOccurrences,
  endMonthFor,
  nextAfter,
  occurrenceDate,
  RECURRING_LIMIT,
  type RepeatMode,
} from "@/lib/finance/recurring";
import { errorCode, log } from "@/lib/log";

import { sealDescription } from "./entries";

/**
 * Fixos (A014). Sem cron: `ensureRecurringUpToDate` anota as ocorrências vencidas
 * quando os dados da pessoa são carregados ("reparo na leitura", exceção registrada
 * no CLAUDE.md). É idempotente: chave única (fixo, mês), compare-and-set na próxima
 * ocorrência e skipDuplicates. Nunca roda em layout nem em prefetch.
 */

const FIELD = "recurring.description";

export interface RecurringView {
  id: string;
  kind: EntryKind;
  amountCents: number;
  categoryId: string;
  description: string | null;
  dayOfMonth: number;
  startMonth: MonthKey;
  endMonth: MonthKey | null;
  nextOccurrenceOn: DateOnly | null;
}

const select = {
  id: true,
  kind: true,
  amountCents: true,
  categoryId: true,
  description: true,
  dayOfMonth: true,
  startMonth: true,
  endMonth: true,
  nextOccurrenceOn: true,
} satisfies Prisma.RecurringSelect;

type Row = Prisma.RecurringGetPayload<{ select: typeof select }>;

function toView(userId: string, row: Row): RecurringView {
  return {
    id: row.id,
    kind: fromDbKind(row.kind),
    amountCents: row.amountCents,
    categoryId: row.categoryId,
    description: tryOpenText(row.description, { field: FIELD, userId, rowId: row.id }),
    dayOfMonth: row.dayOfMonth,
    startMonth: row.startMonth,
    endMonth: row.endMonth,
    nextOccurrenceOn: row.nextOccurrenceOn ? fromDbDate(row.nextOccurrenceOn) : null,
  };
}

export async function listRecurring(userId: string): Promise<RecurringView[]> {
  const rows = await db.recurring.findMany({
    where: { userId },
    orderBy: [{ kind: "desc" }, { dayOfMonth: "asc" }, { createdAt: "asc" }],
    select,
  });
  return rows.map((row) => toView(userId, row));
}

export async function getRecurring(userId: string, id: string): Promise<RecurringView | null> {
  const row = await db.recurring.findFirst({ where: { id, userId }, select });
  return row ? toView(userId, row) : null;
}

/** Anota as ocorrências vencidas até hoje. Uma vez por requisição (cache do React). */
export const ensureRecurringUpToDate = cache(
  async (userId: string, today: DateOnly): Promise<number> => {
    const due = await db.recurring.findMany({
      where: { userId, nextOccurrenceOn: { lte: toDbDate(today) } },
      select,
      take: RECURRING_LIMIT,
    });
    let created = 0;
    for (const row of due) {
      const rule = toView(userId, row);
      const { due: occurrences, next } = dueOccurrences(rule, rule.nextOccurrenceOn, today);
      if (occurrences.length === 0) continue;
      try {
        const [inserted] = await db.$transaction([
          db.entry.createMany({
            data: occurrences.map((o) => {
              const id = randomUUID();
              return {
                id,
                userId,
                kind: toDbKind(rule.kind),
                amountCents: rule.amountCents,
                categoryId: rule.categoryId,
                description: sealDescription(userId, id, rule.description),
                date: toDbDate(o.date),
                recurringId: rule.id,
                occurrenceMonth: o.month,
              };
            }),
            skipDuplicates: true,
          }),
          db.recurring.updateMany({
            where: { id: rule.id, userId, nextOccurrenceOn: row.nextOccurrenceOn },
            data: { nextOccurrenceOn: next ? toDbDate(next) : null },
          }),
        ]);
        created += inserted.count;
      } catch (error) {
        log.error("recurring.ensure_failed", { userId, code: errorCode(error) });
      }
    }
    return created;
  },
);

export interface RecurringInput {
  kind: EntryKind;
  amountCents: number;
  categoryId: string;
  description: string | null;
  dayOfMonth: number;
  startMonth: MonthKey;
  repeat: RepeatMode;
}

export async function countRecurring(userId: string) {
  return db.recurring.count({ where: { userId } });
}

/**
 * Cria um fixo. A primeira ocorrência é a do mês inicial (o formulário escolhe o mês).
 * Com `firstAlreadyRecorded`, a ocorrência do mês inicial já existe (o lançamento que
 * pediu "Repete todo mês") e a próxima fica para o mês seguinte.
 */
export async function createRecurring(
  userId: string,
  input: RecurringInput,
  {
    firstAlreadyRecorded = false,
    id = randomUUID(),
  }: { firstAlreadyRecorded?: boolean; id?: string } = {},
): Promise<RecurringView> {
  const endMonth = endMonthFor(input.startMonth, input.repeat);
  const rule = { dayOfMonth: input.dayOfMonth, startMonth: input.startMonth, endMonth };
  const first = firstAlreadyRecorded
    ? nextAfter(rule, input.startMonth)
    : occurrenceDate(rule, input.startMonth);
  const row = await db.recurring.create({
    data: {
      id,
      userId,
      kind: toDbKind(input.kind),
      amountCents: input.amountCents,
      categoryId: input.categoryId,
      description: sealOptional(input.description, { field: FIELD, userId, rowId: id }),
      dayOfMonth: input.dayOfMonth,
      startMonth: input.startMonth,
      endMonth,
      nextOccurrenceOn: first ? toDbDate(first) : null,
    },
    select,
  });
  return toView(userId, row);
}

/**
 * Edita um fixo: vale dali para a frente. O que já foi anotado não muda.
 * A próxima ocorrência é recalculada a partir do mês da próxima pendente.
 */
export async function updateRecurring(
  userId: string,
  id: string,
  input: Omit<RecurringInput, "startMonth" | "repeat"> & { endMonth: MonthKey | null },
): Promise<RecurringView | null> {
  const current = await getRecurring(userId, id);
  if (!current) return null;
  let next: DateOnly | null = current.nextOccurrenceOn;
  if (next) {
    const month = next.slice(0, 7);
    if (input.endMonth !== null && month > input.endMonth) next = null;
    else
      next = occurrenceDate(
        { ...current, dayOfMonth: input.dayOfMonth, endMonth: input.endMonth },
        month,
      );
  }
  const updated = await db.recurring.updateMany({
    where: { id, userId },
    data: {
      kind: toDbKind(input.kind),
      amountCents: input.amountCents,
      categoryId: input.categoryId,
      description: sealOptional(input.description, { field: FIELD, userId, rowId: id }),
      dayOfMonth: input.dayOfMonth,
      endMonth: input.endMonth,
      nextOccurrenceOn: next ? toDbDate(next) : null,
    },
  });
  return updated.count === 1 ? getRecurring(userId, id) : null;
}

/** "Parar este fixo": apaga a regra; os lançamentos já anotados ficam (vínculo vira nulo). */
export async function deleteRecurring(userId: string, id: string): Promise<boolean> {
  const deleted = await db.recurring.deleteMany({ where: { id, userId } });
  return deleted.count === 1;
}
