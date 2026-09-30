"use server";

import { refresh } from "next/cache";
import { z } from "zod";

import { authedAction, invalid } from "@/lib/actions/server";
import { type ActionResult, fail, ok } from "@/lib/actions/result";
import { findCategory, otherCategory } from "@/lib/categories";
import { isUsableCategory, loadCategories } from "@/lib/data/categories";
import { createEntry, deleteEntry, getEntry, updateEntry } from "@/lib/data/entries";
import { countRecurring, createRecurringWithinLimit } from "@/lib/data/recurring";
import { addDays, isDateOnly, monthOf, parseDate, todayInSaoPaulo } from "@/lib/dates";
import { db } from "@/lib/db";
import { DESCRIPTION_MAX_LENGTH, type EntryKind } from "@/lib/entry";
import { firstMonthFor, RECURRING_LIMIT } from "@/lib/finance/recurring";
import { formatSigned, MAX_CENTS } from "@/lib/money";

/**
 * Lançamentos: criar, editar e excluir (docs/design-system/17-padroes-de-tela.md#adicionar-lançamento).
 * Tudo filtrado pelo userId da sessão; o id do lançamento novo vem do aparelho (idempotente).
 */

const entrySchema = z
  .object({
    kind: z.enum(["expense", "income"]),
    amountCents: z
      .number()
      .int()
      .min(1, "Digite um valor maior que zero.")
      .max(MAX_CENTS, "Esse valor parece alto demais. Confira os números."),
    categoryId: z.string().max(40).nullable(),
    description: z
      .string()
      .trim()
      .max(DESCRIPTION_MAX_LENGTH, `Use no máximo ${DESCRIPTION_MAX_LENGTH} caracteres.`)
      .transform((v) => (v === "" ? null : v))
      .nullable(),
    date: z.string().refine(isDateOnly, "Escolha uma data válida."),
  })
  .strict();

const createSchema = entrySchema.extend({ id: z.uuid(), repeatMonthly: z.boolean() }).strict();
const idSchema = z.uuid();

function checkDate(date: string, today: string) {
  if (date > today)
    return "Lançamento não tem data futura. Para algo que vai acontecer, use um fixo.";
  if (date < addDays(today, -3653)) return "Escolha uma data dos últimos 10 anos.";
  return null;
}

function confirmation(
  verb: "Anotado" | "Alterado",
  kind: EntryKind,
  amount: number,
  title: string | null,
) {
  const value = formatSigned(amount, kind);
  return title ? `${verb}: ${title}, ${value}` : `${verb} em Outros: ${value}`;
}

export async function createEntryAction(
  raw: unknown,
): Promise<ActionResult<{ id: string; message: string }>> {
  return authedAction("entry.create", async (user) => {
    const parsed = createSchema.safeParse(raw);
    if (!parsed.success) return invalid(parsed.error);
    const input = parsed.data;
    const today = todayInSaoPaulo();
    const dateProblem = checkDate(input.date, today);
    if (dateProblem) return { ...fail("invalid"), fields: { date: dateProblem } };

    const categoryId = input.categoryId ?? otherCategory(input.kind);
    if (!(await isUsableCategory(user.id, categoryId, input.kind))) {
      return { ...fail("invalid"), fields: { categoryId: "Escolha uma categoria da lista." } };
    }
    if (input.repeatMonthly && (await countRecurring(user.id)) >= RECURRING_LIMIT) {
      return { ...fail("limit"), fields: { repeatMonthly: "Você chegou ao máximo de 100 fixos." } };
    }

    const result = await createEntry(user.id, input.id, { ...input, categoryId });
    if (result.status === "conflict") return fail("server");

    let message = confirmation(
      "Anotado",
      input.kind,
      input.amountCents,
      input.description ??
        (input.categoryId ? findCategory(await loadCategories(user.id), categoryId).name : null),
    );

    if (input.repeatMonthly && result.status === "created") {
      // O fixo nunca preenche meses passados: se o lançamento é deste mês, ele é a
      // ocorrência do mês; se é de um mês anterior, o fixo começa na próxima data a partir de hoje.
      const day = parseDate(input.date).day;
      const sameMonth = monthOf(input.date) === monthOf(today);
      const startMonth = sameMonth ? monthOf(today) : firstMonthFor(day, today, false);
      const created = await createRecurringWithinLimit(user.id, [
        {
          input: {
            kind: input.kind,
            amountCents: input.amountCents,
            categoryId,
            description: input.description,
            dayOfMonth: day,
            startMonth,
            repeat: { mode: "monthly" },
          },
          firstAlreadyRecorded: sameMonth,
        },
      ]);
      if (created && sameMonth) {
        await db.entry.updateMany({
          where: { id: input.id, userId: user.id },
          data: { recurringId: created[0]!.id, occurrenceMonth: monthOf(input.date) },
        });
      }
      if (created) message += `. Ele se repete todo dia ${day}.`;
    }

    refresh();
    return ok({ id: input.id, message });
  });
}

export async function updateEntryAction(
  rawId: unknown,
  raw: unknown,
): Promise<ActionResult<{ id: string; message: string }>> {
  return authedAction("entry.update", async (user) => {
    const id = idSchema.safeParse(rawId);
    if (!id.success) return fail("not_found");
    const parsed = entrySchema.safeParse(raw);
    if (!parsed.success) return invalid(parsed.error);
    const input = parsed.data;
    const current = await getEntry(user.id, id.data);
    if (!current) return fail("not_found");

    const dateProblem = checkDate(input.date, todayInSaoPaulo());
    if (dateProblem && input.date !== current.date)
      return { ...fail("invalid"), fields: { date: dateProblem } };

    const categoryId = input.categoryId ?? otherCategory(input.kind);
    const keepsCalculator = categoryId === current.categoryId;
    if (
      !(await isUsableCategory(user.id, categoryId, input.kind, {
        allowCalculator: keepsCalculator,
      }))
    ) {
      return { ...fail("invalid"), fields: { categoryId: "Escolha uma categoria da lista." } };
    }
    const updated = await updateEntry(user.id, id.data, { ...input, categoryId });
    if (!updated) return fail("not_found");
    const title = input.description ?? findCategory(await loadCategories(user.id), categoryId).name;
    refresh();
    return ok({
      id: id.data,
      message: confirmation("Alterado", input.kind, input.amountCents, title),
    });
  });
}

export async function deleteEntryAction(
  rawId: unknown,
): Promise<ActionResult<{ message: string }>> {
  return authedAction("entry.delete", async (user) => {
    const id = idSchema.safeParse(rawId);
    if (!id.success) return fail("not_found");
    const deleted = await deleteEntry(user.id, id.data);
    if (!deleted) return fail("not_found");
    const title =
      deleted.description ?? findCategory(await loadCategories(user.id), deleted.categoryId).name;
    refresh();
    return ok({
      message: `Lançamento excluído: ${title}, ${formatSigned(deleted.amountCents, deleted.kind)}`,
    });
  });
}
