"use server";

import { randomUUID } from "node:crypto";

import { refresh } from "next/cache";
import { z } from "zod";

import { authedAction, invalid } from "@/lib/actions/server";
import { type ActionResult, fail, ok } from "@/lib/actions/result";
import { findCategory, otherCategory } from "@/lib/categories";
import { isUsableCategory, loadCategories } from "@/lib/data/categories";
import { removeLimit, setLimit } from "@/lib/data/limits";
import { dismissExpectedIncome, receiveExpectedIncome } from "@/lib/data/planning";
import {
  createRecurringWithinLimit,
  deleteRecurring,
  getSalaryGroup,
  type RecurringInput,
  saveSalary,
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
import { MAX_INSTALLMENTS, type RepeatMode } from "@/lib/finance/recurring";
import { planSalary, type SalaryPayment } from "@/lib/finance/salary";
import { netSalaryFromGross } from "@/lib/labor/calculators";
import { MAX_SALARY_CENTS } from "@/lib/labor/schemas";
import { paymentLabel } from "@/lib/labor/types";
import { formatMoney, formatSigned, MAX_CENTS } from "@/lib/money";

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
const day = z.number().int().min(1).max(31);

/**
 * Opções do salário (só renda fixa na categoria Salário): o valor digitado é líquido ou
 * bruto, e cai numa data só ou dividido em adiantamento e resto. O bruto vira líquido
 * aqui no servidor e é descartado: nunca é gravado nem vai para log ou resposta.
 */
const salaryOptions = z
  .object({
    amountIs: z.enum(["net", "gross"]),
    split: z
      .object({ advancePercent: z.number().int().min(1).max(99), advanceDay: day })
      .strict()
      .nullable(),
  })
  .strict()
  .nullable()
  .default(null);
type SalaryOptions = z.infer<typeof salaryOptions>;

type SalaryProblem = { field: "amountCents" | "salary"; message: string };

/** Líquido e forma de pagamento; o bruto não sai desta função. */
function resolveSalary(
  amountCents: number,
  options: NonNullable<SalaryOptions>,
  today: string,
): { netCents: number; payment: SalaryPayment } | SalaryProblem {
  let netCents = amountCents;
  if (options.amountIs === "gross") {
    if (amountCents > MAX_SALARY_CENTS)
      return {
        field: "amountCents",
        message: "Esse valor parece alto demais. Confira os números.",
      };
    netCents = netSalaryFromGross(amountCents, today).netCents;
    if (netCents < 1)
      return { field: "amountCents", message: "Com esse bruto, não sobra líquido." };
  }
  const payment: SalaryPayment = options.split
    ? { mode: "split", ...options.split }
    : { mode: "single" };
  return { netCents, payment };
}

function salaryMessage(
  items: ReadonlyArray<{ role: string; amountCents: number; dayOfMonth: number }>,
  name: string,
  fromGross: boolean,
) {
  const advance = items.find((i) => i.role === "advance");
  const salary = items.find((i) => i.role === "salary")!;
  if (advance)
    return `${name}: ${formatMoney(advance.amountCents)} no dia ${advance.dayOfMonth} e ${formatMoney(salary.amountCents)} no dia ${salary.dayOfMonth}.`;
  const base = `${name} entra todo dia ${salary.dayOfMonth}.`;
  return fromGross
    ? `${base} Cai na conta cerca de ${formatMoney(salary.amountCents)} por mês.`
    : base;
}

function salaryAllowed(kind: string, categoryId: string) {
  return kind === "income" && categoryId === "salario";
}

const recurringSchema = z
  .object({
    kind: z.enum(["expense", "income"]),
    amountCents: amount,
    categoryId: z.string().max(40).nullable(),
    description,
    dayOfMonth: day,
    startMonth: month,
    repeat,
    salary: salaryOptions,
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
    const name = input.description ?? findCategory(await loadCategories(user.id), categoryId).name;

    if (input.salary) {
      if (!salaryAllowed(input.kind, categoryId) || input.repeat.mode !== "monthly")
        return { ...fail("invalid"), fields: { salary: "Essa opção é só para o salário." } };
      const today = todayInSaoPaulo();
      const resolved = resolveSalary(input.amountCents, input.salary, today);
      if ("field" in resolved)
        return { ...fail("invalid"), fields: { [resolved.field]: resolved.message } };
      const plan = planSalary(resolved.netCents, input.dayOfMonth, resolved.payment, today);
      if (!plan.ok)
        return {
          ...fail("invalid"),
          fields: { amountCents: "Valor pequeno demais para dividir." },
        };
      // Numa data só, vale a resposta de "Já anotou o deste mês?" (o mês inicial da tela).
      const items =
        resolved.payment.mode === "single"
          ? plan.items.map((i) => ({ ...i, startMonth: input.startMonth }))
          : plan.items;
      const saved = await saveSalary(user.id, null, items, input.description);
      if (!saved) return fail("limit", "Você chegou ao máximo de 100 fixos.");
      refresh();
      return ok({
        id: saved.salary.id,
        message: salaryMessage(items, name, input.salary.amountIs === "gross"),
      });
    }

    const created = (
      await createRecurringWithinLimit(user.id, [{ input: { ...input, categoryId } }])
    )?.[0];
    if (!created) return fail("limit", "Você chegou ao máximo de 100 fixos.");
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
    const group = await getSalaryGroup(user.id, id.data);
    if (!group) return fail("not_found");
    // Editar o adiantamento é editar o salário dele: os dois andam juntos.
    const current = group.salary;
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
    if (input.salary || group.advance) {
      if (!input.salary || !salaryAllowed(input.kind, categoryId) || input.endMonth !== null)
        return { ...fail("invalid"), fields: { salary: "Essa opção é só para o salário." } };
      const today = todayInSaoPaulo();
      const resolved = resolveSalary(input.amountCents, input.salary, today);
      if ("field" in resolved)
        return { ...fail("invalid"), fields: { [resolved.field]: resolved.message } };
      const plan = planSalary(resolved.netCents, input.dayOfMonth, resolved.payment, today);
      if (!plan.ok)
        return {
          ...fail("invalid"),
          fields: { amountCents: "Valor pequeno demais para dividir." },
        };
      const saved = await saveSalary(user.id, current.id, plan.items, input.description);
      if (!saved) return fail("limit", "Você chegou ao máximo de 100 fixos.");
      refresh();
      return ok({ message: "Salário alterado. Vale dali para a frente." });
    }

    const updated = await updateRecurring(user.id, current.id, {
      kind: input.kind,
      amountCents: input.amountCents,
      categoryId,
      description: input.description,
      dayOfMonth: input.dayOfMonth,
      endMonth: input.endMonth,
    });
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
      .object({ amountCents: amount, dayOfMonth: day, salary: salaryOptions })
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
    for (const e of expenses) {
      if (!(await isUsableCategory(user.id, e.categoryId, "expense"))) {
        return { ...fail("invalid"), fields: { expenses: "Escolha categorias da lista." } };
      }
    }
    const today = todayInSaoPaulo();
    const current = monthOf(today);
    const startFor = (day: number, include: boolean) =>
      clampDay(current, day) >= today || include ? current : addMonths(current, 1);

    const items: Array<{ input: RecurringInput; id?: string }> = [];
    if (income) {
      const resolved = resolveSalary(
        income.amountCents,
        income.salary ?? { amountIs: "net", split: null },
        today,
      );
      if ("field" in resolved) return { ...fail("invalid"), fields: { income: resolved.message } };
      const plan = planSalary(resolved.netCents, income.dayOfMonth, resolved.payment, today);
      if (!plan.ok)
        return { ...fail("invalid"), fields: { income: "Valor pequeno demais para dividir." } };
      const salaryId = randomUUID();
      // O salário primeiro: o adiantamento aponta para ele.
      const ordered = [
        ...plan.items.filter((i) => i.role === "salary"),
        ...plan.items.filter((i) => i.role === "advance"),
      ];
      for (const item of ordered) {
        const isSalary = item.role === "salary";
        items.push({
          id: isSalary ? salaryId : undefined,
          input: {
            kind: "income",
            amountCents: item.amountCents,
            categoryId: "salario",
            description: isSalary ? "Salário" : "Adiantamento",
            dayOfMonth: item.dayOfMonth,
            startMonth: item.startMonth,
            repeat: { mode: "monthly" },
            salaryId: isSalary ? null : salaryId,
          },
        });
      }
    }
    for (const e of expenses) {
      const repeatMode: RepeatMode = e.installments
        ? { mode: "installments", count: e.installments }
        : { mode: "monthly" };
      items.push({
        input: {
          kind: "expense",
          amountCents: e.amountCents,
          categoryId: e.categoryId,
          description: e.presetLabel,
          dayOfMonth: e.dayOfMonth,
          startMonth: startFor(e.dayOfMonth, e.alreadyHappened),
          repeat: repeatMode,
        },
      });
    }
    if (!(await createRecurringWithinLimit(user.id, items))) {
      return fail("limit", "Você chegou ao máximo de 100 fixos.");
    }
    refresh();
    return ok({ message: "Seu mês está montado." });
  });
}
