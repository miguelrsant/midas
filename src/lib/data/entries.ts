import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { sealOptional, tryOpenText } from "@/lib/crypto/fields";
import {
  addDays,
  addMonths,
  type DateOnly,
  firstDay,
  fromDbDate,
  type MonthKey,
  toDbDate,
} from "@/lib/dates";
import { db } from "@/lib/db";
import { type EntryKind, fromDbKind, toDbKind } from "@/lib/entry";

/**
 * Lançamentos (A010). Toda consulta filtra pelo userId da sessão; toda mudança usa
 * updateMany/deleteMany com { id, userId } e confere a contagem. A descrição é cifrada
 * com a linha (entry.description|userId|id).
 */

const FIELD = "entry.description";

export interface EntryView {
  id: string;
  kind: EntryKind;
  amountCents: number;
  categoryId: string;
  description: string | null;
  date: DateOnly;
  recurringId: string | null;
  createdAt: Date;
}

const select = {
  id: true,
  kind: true,
  amountCents: true,
  categoryId: true,
  description: true,
  date: true,
  recurringId: true,
  createdAt: true,
} satisfies Prisma.EntrySelect;

type Row = Prisma.EntryGetPayload<{ select: typeof select }>;

export function toView(userId: string, row: Row): EntryView {
  return {
    id: row.id,
    kind: fromDbKind(row.kind),
    amountCents: row.amountCents,
    categoryId: row.categoryId,
    description: tryOpenText(row.description, { field: FIELD, userId, rowId: row.id }),
    date: fromDbDate(row.date),
    recurringId: row.recurringId,
    createdAt: row.createdAt,
  };
}

export function sealDescription(userId: string, rowId: string, text: string | null) {
  return sealOptional(text, { field: FIELD, userId, rowId });
}

/** Lançamentos de um intervalo de meses [from, to], do mais novo para o mais antigo. */
export async function listEntries(
  userId: string,
  from: MonthKey,
  to: MonthKey,
): Promise<EntryView[]> {
  const rows = await db.entry.findMany({
    where: {
      userId,
      date: { gte: toDbDate(firstDay(from)), lt: toDbDate(firstDay(addMonths(to, 1))) },
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    select,
  });
  return rows.map((row) => toView(userId, row));
}

export async function recentEntries(userId: string, take: number): Promise<EntryView[]> {
  const rows = await db.entry.findMany({
    where: { userId },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take,
    select,
  });
  return rows.map((row) => toView(userId, row));
}

export async function getEntry(userId: string, id: string): Promise<EntryView | null> {
  const row = await db.entry.findFirst({ where: { id, userId }, select });
  return row ? toView(userId, row) : null;
}

/** Fatos mínimos para somas e projeção (sem descrição, que não precisa ser aberta). */
export async function entryFacts(userId: string, from: MonthKey, to: MonthKey) {
  const rows = await db.entry.findMany({
    where: {
      userId,
      date: { gte: toDbDate(firstDay(from)), lt: toDbDate(firstDay(addMonths(to, 1))) },
    },
    select: { kind: true, amountCents: true, categoryId: true, date: true, recurringId: true },
  });
  return rows.map((r) => ({
    kind: fromDbKind(r.kind),
    amountCents: r.amountCents,
    categoryId: r.categoryId,
    date: fromDbDate(r.date),
    fromRecurring: r.recurringId !== null,
  }));
}

export async function firstEntryDate(userId: string): Promise<DateOnly | null> {
  const row = await db.entry.findFirst({
    where: { userId },
    orderBy: { date: "asc" },
    select: { date: true },
  });
  return row ? fromDbDate(row.date) : null;
}

/** Quantas vezes cada categoria foi usada nos últimos 90 dias (ordem dos chips). */
export async function categoryUsage(userId: string, today: DateOnly): Promise<Map<string, number>> {
  const rows = await db.entry.groupBy({
    by: ["categoryId"],
    where: { userId, date: { gte: toDbDate(addDays(today, -90)) } },
    _count: { _all: true },
  });
  return new Map(rows.map((r) => [r.categoryId, r._count._all]));
}

export interface EntryInput {
  kind: EntryKind;
  amountCents: number;
  categoryId: string;
  description: string | null;
  date: DateOnly;
}

/**
 * Cria com o id gerado no aparelho, de forma idempotente: salvar duas vezes não
 * duplica. Nunca usa upsert por id (um id repetido de outra conta não é tocado).
 */
export async function createEntry(
  userId: string,
  id: string,
  input: EntryInput,
  extra: { recurringId?: string; occurrenceMonth?: MonthKey } = {},
): Promise<{ status: "created" | "replayed" | "conflict"; entry: EntryView | null }> {
  const created = await db.entry.createMany({
    data: [
      {
        id,
        userId,
        kind: toDbKind(input.kind),
        amountCents: input.amountCents,
        categoryId: input.categoryId,
        description: sealDescription(userId, id, input.description),
        date: toDbDate(input.date),
        recurringId: extra.recurringId ?? null,
        occurrenceMonth: extra.occurrenceMonth ?? null,
      },
    ],
    skipDuplicates: true,
  });
  const entry = await getEntry(userId, id);
  if (created.count === 1) return { status: "created", entry };
  return entry ? { status: "replayed", entry } : { status: "conflict", entry: null };
}

export async function updateEntry(
  userId: string,
  id: string,
  input: EntryInput,
): Promise<EntryView | null> {
  const updated = await db.entry.updateMany({
    where: { id, userId },
    data: {
      kind: toDbKind(input.kind),
      amountCents: input.amountCents,
      categoryId: input.categoryId,
      description: sealDescription(userId, id, input.description),
      date: toDbDate(input.date),
    },
  });
  return updated.count === 1 ? getEntry(userId, id) : null;
}

export async function deleteEntry(userId: string, id: string): Promise<EntryView | null> {
  const entry = await getEntry(userId, id);
  if (!entry) return null;
  const deleted = await db.entry.deleteMany({ where: { id, userId } });
  return deleted.count === 1 ? entry : null;
}

export async function countEntries(userId: string) {
  return db.entry.count({ where: { userId } });
}
