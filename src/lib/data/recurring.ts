import "server-only";

import { randomUUID } from "node:crypto";

import { cache } from "react";

import { Prisma } from "@/generated/prisma/client";
import { sealOptional, tryOpenText } from "@/lib/crypto/fields";
import {
  type DateOnly,
  fromDbDate,
  type MonthKey,
  monthOf,
  toDbDate,
  todayInSaoPaulo,
} from "@/lib/dates";
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
import { type Tx, withUserLock } from "./lock";

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
  /** Só no adiantamento: o fixo do salário a que ele pertence. */
  salaryId: string | null;
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
  salaryId: true,
  createdAt: true,
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
    salaryId: row.salaryId,
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

export async function getRecurring(
  userId: string,
  id: string,
  client: Tx | typeof db = db,
): Promise<RecurringView | null> {
  const row = await client.recurring.findFirst({ where: { id, userId }, select });
  return row ? toView(userId, row) : null;
}

/**
 * O salário e o adiantamento dele, a partir de qualquer um dos dois. Para um fixo que
 * não é salário dividido, `advance` é nulo e `salary` é o próprio fixo.
 */
export async function getSalaryGroup(
  userId: string,
  id: string,
  client: Tx | typeof db = db,
): Promise<{ salary: RecurringView; advance: RecurringView | null } | null> {
  const row = await getRecurring(userId, id, client);
  if (!row) return null;
  if (row.salaryId) {
    const salary = await getRecurring(userId, row.salaryId, client);
    return salary ? { salary, advance: row } : null;
  }
  const advance = await client.recurring.findFirst({
    where: { userId, salaryId: row.id },
    orderBy: { createdAt: "asc" },
    select,
  });
  return { salary: row, advance: advance ? toView(userId, advance) : null };
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
      const { due, next } = dueOccurrences(rule, rule.nextOccurrenceOn, today);
      if (due.length === 0) continue;
      // Defesa extra: um fixo nunca anota meses anteriores ao mês em que foi criado.
      const createdMonth = monthOf(todayInSaoPaulo(row.createdAt));
      const occurrences = due.filter((o) => o.month >= createdMonth);
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
  /** Só no adiantamento: o fixo do salário (do mesmo dono, conferido aqui). */
  salaryId?: string | null;
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
    client = db,
  }: { firstAlreadyRecorded?: boolean; id?: string; client?: Tx | typeof db } = {},
): Promise<RecurringView> {
  const endMonth = endMonthFor(input.startMonth, input.repeat);
  const rule = { dayOfMonth: input.dayOfMonth, startMonth: input.startMonth, endMonth };
  const first = firstAlreadyRecorded
    ? nextAfter(rule, input.startMonth)
    : occurrenceDate(rule, input.startMonth);
  const row = await client.recurring.create({
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
      salaryId: input.salaryId ?? null,
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
  input: Omit<RecurringInput, "startMonth" | "repeat" | "salaryId"> & {
    endMonth: MonthKey | null;
  },
  client: Tx | typeof db = db,
): Promise<RecurringView | null> {
  const current = await getRecurring(userId, id, client);
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
  const updated = await client.recurring.updateMany({
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
  return updated.count === 1 ? getRecurring(userId, id, client) : null;
}

/**
 * "Parar este fixo": apaga a regra; os lançamentos já anotados ficam (vínculo vira nulo).
 * Salário dividido para inteiro: parar o adiantamento ou o salário apaga os dois.
 */
export async function deleteRecurring(userId: string, id: string): Promise<boolean> {
  const row = await db.recurring.findFirst({ where: { id, userId }, select: { salaryId: true } });
  if (!row) return false;
  // Apagar o salário leva o adiantamento junto (ON DELETE CASCADE).
  const deleted = await db.recurring.deleteMany({ where: { id: row.salaryId ?? id, userId } });
  return deleted.count === 1;
}

/**
 * Cria vários fixos respeitando o teto por pessoa, com a contagem e a criação na
 * mesma transação travada. Devolve null se passar do teto.
 */
export async function createRecurringWithinLimit(
  userId: string,
  items: ReadonlyArray<{ input: RecurringInput; firstAlreadyRecorded?: boolean; id?: string }>,
): Promise<RecurringView[] | null> {
  return withUserLock(userId, async (tx) => {
    const count = await tx.recurring.count({ where: { userId } });
    if (count + items.length > RECURRING_LIMIT) return null;
    const created: RecurringView[] = [];
    for (const item of items) {
      created.push(
        await createRecurring(userId, item.input, {
          firstAlreadyRecorded: item.firstAlreadyRecorded,
          id: item.id,
          client: tx,
        }),
      );
    }
    return created;
  });
}

export interface SalaryPlanItem {
  role: "advance" | "salary";
  amountCents: number;
  dayOfMonth: number;
  startMonth: MonthKey;
}

/**
 * Cria ou edita um salário (numa data só ou dividido em adiantamento e resto), tudo na
 * mesma transação travada e dentro do teto de fixos. Na edição, `salaryId` é o fixo do
 * salário (já conferido com getSalaryGroup); o adiantamento é criado, mudado ou apagado
 * conforme o plano. Devolve null se passar do teto ou se o fixo sumiu.
 */
export async function saveSalary(
  userId: string,
  salaryId: string | null,
  plan: readonly SalaryPlanItem[],
  description: string | null,
): Promise<{ salary: RecurringView; advance: RecurringView | null } | null> {
  const salaryItem = plan.find((i) => i.role === "salary");
  const advanceItem = plan.find((i) => i.role === "advance") ?? null;
  if (!salaryItem) throw new Error("plano sem salário");
  return withUserLock(userId, async (tx) => {
    const count = await tx.recurring.count({ where: { userId } });
    const base = { kind: "income" as const, categoryId: "salario" };

    if (!salaryId) {
      if (count + plan.length > RECURRING_LIMIT) return null;
      const salary = await createRecurring(
        userId,
        { ...base, ...salaryItem, description, repeat: { mode: "monthly" } },
        { client: tx },
      );
      const advance = advanceItem
        ? await createRecurring(
            userId,
            {
              ...base,
              ...advanceItem,
              description: "Adiantamento",
              repeat: { mode: "monthly" },
              salaryId: salary.id,
            },
            { client: tx },
          )
        : null;
      return { salary, advance };
    }

    const group = await getSalaryGroup(userId, salaryId, tx);
    if (!group || group.salary.id !== salaryId) return null;
    const salary = await updateRecurring(
      userId,
      salaryId,
      {
        ...base,
        amountCents: salaryItem.amountCents,
        dayOfMonth: salaryItem.dayOfMonth,
        description,
        endMonth: group.salary.endMonth,
      },
      tx,
    );
    if (!salary) return null;
    let advance: RecurringView | null = null;
    if (advanceItem && group.advance) {
      advance = await updateRecurring(
        userId,
        group.advance.id,
        {
          ...base,
          amountCents: advanceItem.amountCents,
          dayOfMonth: advanceItem.dayOfMonth,
          description: group.advance.description,
          endMonth: group.advance.endMonth,
        },
        tx,
      );
    } else if (advanceItem) {
      if (count + 1 > RECURRING_LIMIT) return null;
      advance = await createRecurring(
        userId,
        {
          ...base,
          ...advanceItem,
          description: "Adiantamento",
          repeat: { mode: "monthly" },
          salaryId,
        },
        { client: tx },
      );
    } else if (group.advance) {
      await tx.recurring.deleteMany({ where: { id: group.advance.id, userId } });
    }
    return { salary, advance };
  });
}
