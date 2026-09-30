"use server";

import { refresh } from "next/cache";
import { z } from "zod";

import type { CalculatorKind } from "@/generated/prisma/client";
import { authedAction, invalid } from "@/lib/actions/server";
import { type ActionResult, fail, ok } from "@/lib/actions/result";
import { addCalculationToPlan, deleteCalculation } from "@/lib/data/planning";
import { createRecurringWithinLimit, updateRecurring } from "@/lib/data/recurring";
import { addMonths, clampDay, monthName, monthOf, todayInSaoPaulo } from "@/lib/dates";
import { db } from "@/lib/db";
import {
  calculateNetSalary,
  calculateTermination,
  calculateThirteenth,
  calculateUnemployment,
  calculateVacation,
} from "@/lib/labor/calculators";
import { LaborInputError } from "@/lib/labor/errors";
import {
  netSalaryInput,
  terminationInput,
  thirteenthInput,
  unemploymentInput,
  vacationInput,
} from "@/lib/labor/schemas";
import { LABOR_ENGINE_VERSION, type LaborResult } from "@/lib/labor/types";

/**
 * "Adicionar ao planejamento" das calculadoras (docs/design-system/17-padroes-de-tela.md#resultado).
 * O servidor refaz a conta a partir das respostas validadas; nunca aceita o resultado
 * vindo do aparelho. Idempotente pelo id gerado no aparelho.
 */

const request = z.discriminatedUnion("kind", [
  z.object({ id: z.uuid(), kind: z.literal("VACATION"), input: vacationInput }).strict(),
  z.object({ id: z.uuid(), kind: z.literal("THIRTEENTH"), input: thirteenthInput }).strict(),
  z.object({ id: z.uuid(), kind: z.literal("TERMINATION"), input: terminationInput }).strict(),
  z.object({ id: z.uuid(), kind: z.literal("NET_SALARY"), input: netSalaryInput }).strict(),
  z.object({ id: z.uuid(), kind: z.literal("UNEMPLOYMENT"), input: unemploymentInput }).strict(),
]);

type Request = z.infer<typeof request>;

function compute(req: Request): LaborResult {
  switch (req.kind) {
    case "VACATION":
      return calculateVacation(req.input);
    case "THIRTEENTH":
      return calculateThirteenth(req.input);
    case "TERMINATION":
      return calculateTermination(req.input);
    case "NET_SALARY":
      return calculateNetSalary(req.input);
    case "UNEMPLOYMENT":
      return calculateUnemployment(req.input);
  }
}

const NAMES: Record<CalculatorKind, string> = {
  VACATION: "Férias adicionadas",
  THIRTEENTH: "13º adicionado",
  TERMINATION: "Rescisão adicionada",
  NET_SALARY: "Salário adicionado",
  UNEMPLOYMENT: "Seguro-desemprego adicionado",
};

export async function addToPlanAction(raw: unknown): Promise<ActionResult<{ message: string }>> {
  return authedAction("calculation.add", async (user) => {
    const parsed = request.safeParse(raw);
    if (!parsed.success) return invalid(parsed.error);
    const req = parsed.data;
    let result: LaborResult;
    try {
      result = compute(req);
    } catch (error) {
      if (error instanceof LaborInputError) return fail("invalid", error.message);
      throw error;
    }

    if (req.kind === "NET_SALARY") {
      const input = req.input;
      const today = todayInSaoPaulo();
      const current = monthOf(today);
      const start = clampDay(current, input.payDay) >= today ? current : addMonths(current, 1);
      const existing = await db.recurring.findFirst({
        where: { userId: user.id, kind: "INCOME", categoryId: "salario" },
        orderBy: { createdAt: "asc" },
        select: { id: true, endMonth: true },
      });
      if (existing) {
        await updateRecurring(user.id, existing.id, {
          kind: "income",
          amountCents: result.headlineCents,
          categoryId: "salario",
          description: "Salário",
          dayOfMonth: input.payDay,
          endMonth: existing.endMonth,
        });
      } else {
        const created = await createRecurringWithinLimit(user.id, [
          {
            input: {
              kind: "income",
              amountCents: result.headlineCents,
              categoryId: "salario",
              description: "Salário",
              dayOfMonth: input.payDay,
              startMonth: start,
              repeat: { mode: "monthly" },
            },
          },
        ]);
        if (!created) return fail("limit", "Você chegou ao máximo de 100 fixos.");
      }
    }

    const status = await addCalculationToPlan(
      user.id,
      req.id,
      req.kind,
      { input: req.input, result, engineVersion: LABOR_ENGINE_VERSION },
      result.payments,
    );
    if (status === "conflict") return fail("server");
    refresh();

    if (req.kind === "NET_SALARY")
      return ok({ message: `Seu salário entra todo dia ${req.input.payDay}.` });
    const first = result.payments[0];
    const when = first ? ` de ${monthName(monthOf(first.dueDate))}` : "";
    return ok({ message: `${NAMES[req.kind]} ao planejamento${when}.` });
  });
}

export async function deleteCalculationAction(
  rawId: unknown,
): Promise<ActionResult<{ message: string }>> {
  return authedAction("calculation.delete", async (user) => {
    const id = z.uuid().safeParse(rawId);
    if (!id.success || !(await deleteCalculation(user.id, id.data))) return fail("not_found");
    refresh();
    return ok({ message: "Conta apagada. As rendas previstas dela saíram do planejamento." });
  });
}
