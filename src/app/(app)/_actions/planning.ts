"use server";

import { refresh } from "next/cache";
import { z } from "zod";

import { authedAction, invalid } from "@/lib/actions/server";
import { type ActionResult, fail, ok } from "@/lib/actions/result";
import { findCategory, otherCategory } from "@/lib/categories";
import { isUsableCategory, loadCategories } from "@/lib/data/categories";
import { removeLimit, setLimit } from "@/lib/data/limits";
import { dismissExpectedIncome, receiveExpectedIncome } from "@/lib/data/planning";
import {
  countRecurring,
  createRecurring,
  deleteRecurring,
  getRecurring,
  updateRecurring,
} from "@/lib/data/recurring";
import {
  addDays,
  addMonths,
  clampDay,
  isDateOnly,
  isMonthKey,
  type MonthKey,
  monthName,
  monthOf,
  todayInSaoPaulo,
} from "@/lib/dates";
import { db } from "@/lib/db";
import { DESCRIPTION_MAX_LENGTH } from "@/lib/entry";
import { MAX_INSTALLMENTS, RECURRING_LIMIT, type RepeatMode } from "@/lib/finance/recurring";
import { paymentLabel } from "@/lib/labor/types";
import { formatSigned, MAX_CENTS } from "@/lib/money";

/** Planejamento: fixos, limites e rendas previstas (docs/design-system/17-padroes-de-tela.md#planejamento). */

const amount = z
  .number()
  .int()
  .min(1, "Digite um valor maior que zero.")
  .max(MAX_CENTS, "Esse valor parece alto demais. Confira os números.");
const description = z
  .string()
  .trim()
  .max(DESCRIPTION_MAX_LENGTH, `Use no máximo ${DESCRIPTION_MAX_LENGTH} caracteres.`)
  .transform((v) => (v === "" ? null : v))
  .nullable();
const repeat = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("monthly") }).strict(),
  z
    .object({
      mode: z.literal("installments"),
      count: z.number().int().min(2).max(MAX_INSTALLMENTS),
    })
    .strict(),
  z.object({ mode: z.literal("once") }).strict(),
]);
const month = z.string().refine(isMonthKey, "Escolha um mês válido.");

const recurringSchema = z
  .object({
    kind: z.enum(["expense", "income"]),
    amountCents: amount,
    categoryId: z.string().max(40).nullable(),
    description,
    dayOfMonth: z.number().int().min(1).max(31),
    startMonth: month,
    repeat,
  })
  .strict();

function checkStart(start: MonthKey) {
  const current = monthOf(todayInSaoPaulo());
  if (start < current) return "O fixo começa neste mês ou depois.";
  if (start > addMonths(current, 24)) return "Escolha um mês dos próximos 2 anos.";
  return null;
}

function everyText(dayOfMonth: number, repeatMode: RepeatMode, start: MonthKey) {
  if (repeatMode.mode === "once")
    return `entra em ${clampDay(start, dayOfMonth).slice(8)} de ${monthName(start)}`;
  if (repeatMode.mode === "installments")
    return `entra todo dia ${dayOfMonth}, ${repeatMode.count} vezes`;
  return `entra todo dia ${dayOfMonth}`;
}

export async function createRecurringAction(
  raw: unknown,
): Promise<ActionResult<{ id: string; message: string }>> {
  return authedAction("recurring.create", async (user) => {
    const parsed = recurringSchema.safeParse(raw);
    if (!parsed.success) return invalid(parsed.error);
    const input = parsed.data;
    const startProblem = checkStart(input.startMonth);
    if (startProblem) return { ...fail("invalid"), fields: { startMonth: startProblem } };
    const categoryId = input.categoryId ?? otherCategory(input.kind);
    if (!(await isUsableCategory(user.id, categoryId, input.kind))) {
      return { ...fail("invalid"), fields: { categoryId: "Escolha uma categoria da lista." } };
    }
    if ((await countRecurring(user.id)) >= RECURRING_LIMIT)
      return fail("limit", "Você chegou ao máximo de 100 fixos.");
    const created = await createRecurring(user.id, { ...input, categoryId });
    const name = input.description ?? findCategory(await loadCategories(user.id), categoryId).name;
    refresh();
    return ok({
      id: created.id,
      message: `${name} ${everyText(input.dayOfMonth, input.repeat, input.startMonth)}.`,
    });
  });
}

const updateSchema = recurringSchema.omit({ startMonth: true, repeat: true }).extend({
  endMonth: month.nullable(),
});

export async function updateRecurringAction(
  rawId: unknown,
  raw: unknown,
): Promise<ActionResult<{ message: string }>> {
  return authedAction("recurring.update", async (user) => {
    const id = z.uuid().safeParse(rawId);
    if (!id.success) return fail("not_found");
    const parsed = updateSchema.strict().safeParse(raw);
    if (!parsed.success) return invalid(parsed.error);
    const current = await getRecurring(user.id, id.data);
    if (!current) return fail("not_found");
    const input = parsed.data;
    if (input.endMonth !== null && input.endMonth < current.startMonth) {
      return {
        ...fail("invalid"),
        fields: { endMonth: "O último mês precisa ser depois do primeiro." },
      };
    }
    const categoryId = input.categoryId ?? otherCategory(input.kind);
    if (!(await isUsableCategory(user.id, categoryId, input.kind))) {
      return { ...fail("invalid"), fields: { categoryId: "Escolha uma categoria da lista." } };
    }
    const updated = await updateRecurring(user.id, id.data, { ...input, categoryId });
    if (!updated) return fail("not_found");
    refresh();
    return ok({ message: "Fixo alterado. Vale dali para a frente." });
  });
}

export async function deleteRecurringAction(
  rawId: unknown,
): Promise<ActionResult<{ message: string }>> {
  return authedAction("recurring.delete", async (user) => {
    const id = z.uuid().safeParse(rawId);
    if (!id.success) return fail("not_found");
    if (!(await deleteRecurring(user.id, id.data))) return fail("not_found");
    refresh();
    return ok({ message: "Fixo parado. O que já foi anotado continua na lista." });
  });
}

const limitSchema = z.object({ categoryId: z.string().max(40), amountCents: amount }).strict();

export async function setLimitAction(raw: unknown): Promise<ActionResult<{ message: string }>> {
  return authedAction("limit.set", async (user) => {
    const parsed = limitSchema.safeParse(raw);
    if (!parsed.success) return invalid(parsed.error);
    if (!(await isUsableCategory(user.id, parsed.data.categoryId, "expense"))) {
      return { ...fail("invalid"), fields: { categoryId: "Escolha uma categoria de gasto." } };
    }
    await setLimit(user.id, parsed.data.categoryId, parsed.data.amountCents);
    const name = findCategory(await loadCategories(user.id), parsed.data.categoryId).name;
    refresh();
    return ok({ message: `Limite de ${name} salvo.` });
  });
}

export async function removeLimitAction(
  rawCategory: unknown,
): Promise<ActionResult<{ message: string }>> {
  return authedAction("limit.remove", async (user) => {
    const id = z.string().max(40).safeParse(rawCategory);
    if (!id.success || !(await removeLimit(user.id, id.data))) return fail("not_found");
    refresh();
    return ok({ message: "Limite removido." });
  });
}

const receiveSchema = z
  .object({
    expectedId: z.uuid(),
    entryId: z.uuid(),
    amountCents: amount,
    date: z.string().refine(isDateOnly, "Escolha uma data válida."),
  })
  .strict();

export async function receiveExpectedAction(
  raw: unknown,
): Promise<ActionResult<{ message: string }>> {
  return authedAction("expected.receive", async (user) => {
    const parsed = receiveSchema.safeParse(raw);
    if (!parsed.success) return invalid(parsed.error);
    const input = parsed.data;
    const today = todayInSaoPaulo();
    if (input.date > today || input.date < addDays(today, -366)) {
      return { ...fail("invalid"), fields: { date: "Escolha uma data até hoje." } };
    }
    const expected = await db.expectedIncome.findFirst({
      where: { id: input.expectedId, userId: user.id },
      select: { labelKey: true },
    });
    if (!expected) return fail("not_found");
    const label = paymentLabel(expected.labelKey);
    const done = await receiveExpectedIncome(user.id, input.expectedId, input.entryId, {
      amountCents: input.amountCents,
      date: input.date,
      description: label,
    });
    if (!done) return fail("not_found");
    refresh();
    return ok({ message: `Anotado: ${label}, ${formatSigned(input.amountCents, "income")}` });
  });
}

export async function dismissExpectedAction(
  rawId: unknown,
): Promise<ActionResult<{ message: string }>> {
  return authedAction("expected.dismiss", async (user) => {
    const id = z.uuid().safeParse(rawId);
    if (!id.success || !(await dismissExpectedIncome(user.id, id.data))) return fail("not_found");
    refresh();
    return ok({ message: "Renda prevista tirada do planejamento." });
  });
}

/** "Monte seu mês": renda fixa + gastos fixos prontos, de uma vez. */
const starterSchema = z
  .object({
    income: z
      .object({ amountCents: amount, dayOfMonth: z.number().int().min(1).max(31) })
      .strict()
      .nullable(),
    expenses: z
      .array(
        z
          .object({
            presetLabel: z.string().trim().min(1).max(DESCRIPTION_MAX_LENGTH),
            categoryId: z.string().max(40),
            amountCents: amount,
            dayOfMonth: z.number().int().min(1).max(31),
            installments: z.number().int().min(2).max(MAX_INSTALLMENTS).nullable(),
            alreadyHappened: z.boolean(),
          })
          .strict(),
      )
      .max(20),
  })
  .strict();

export async function saveStarterPlanAction(
  raw: unknown,
): Promise<ActionResult<{ message: string }>> {
  return authedAction("recurring.starter", async (user) => {
    const parsed = starterSchema.safeParse(raw);
    if (!parsed.success) return invalid(parsed.error);
    const { income, expenses } = parsed.data;
    if ((await countRecurring(user.id)) + expenses.length + 1 > RECURRING_LIMIT) {
      return fail("limit", "Você chegou ao máximo de 100 fixos.");
    }
    for (const e of expenses) {
      if (!(await isUsableCategory(user.id, e.categoryId, "expense"))) {
        return { ...fail("invalid"), fields: { expenses: "Escolha categorias da lista." } };
      }
    }
    const today = todayInSaoPaulo();
    const current = monthOf(today);
    const startFor = (day: number, include: boolean) =>
      clampDay(current, day) >= today || include ? current : addMonths(current, 1);

    if (income) {
      await createRecurring(user.id, {
        kind: "income",
        amountCents: income.amountCents,
        categoryId: "salario",
        description: "Salário",
        dayOfMonth: income.dayOfMonth,
        startMonth: startFor(income.dayOfMonth, false),
        repeat: { mode: "monthly" },
      });
    }
    for (const e of expenses) {
      const repeatMode: RepeatMode = e.installments
        ? { mode: "installments", count: e.installments }
        : { mode: "monthly" };
      await createRecurring(user.id, {
        kind: "expense",
        amountCents: e.amountCents,
        categoryId: e.categoryId,
        description: e.presetLabel,
        dayOfMonth: e.dayOfMonth,
        startMonth: startFor(e.dayOfMonth, e.alreadyHappened),
        repeat: repeatMode,
      });
    }
    refresh();
    return ok({ message: "Seu mês está montado." });
  });
}
