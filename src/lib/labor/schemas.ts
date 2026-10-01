import { z } from "zod";

import { isDateOnly } from "@/lib/dates";

import { MAX_SALARY_CENTS } from "./types";

/**
 * Respostas das calculadoras, validadas igual no aparelho e no servidor.
 * O servidor refaz a conta a partir disto; nunca aceita resultado pronto.
 */

/** Teto do salário: definido em types.ts, sem Zod. */
export { MAX_SALARY_CENTS };

const cents = z.number().int().min(0).max(MAX_SALARY_CENTS);
const salary = z
  .number()
  .int()
  .min(1, "Digite o salário.")
  .max(MAX_SALARY_CENTS, "Esse valor parece alto demais. Confira os números.");
const date = z.string().refine(isDateOnly, "Escolha uma data válida.");
const dependents = z.number().int().min(0).max(20);

export const vacationInput = z
  .object({
    grossCents: salary,
    extrasCents: cents.default(0),
    days: z
      .number()
      .int()
      .min(5, "Férias têm pelo menos 5 dias.")
      .max(30, "Férias têm no máximo 30 dias."),
    sellTen: z.boolean(),
    startDate: date,
    dependents: dependents.default(0),
  })
  .strict()
  .refine((v) => !v.sellTen || v.days + 10 <= 30, {
    path: ["sellTen"],
    message: "Para vender 10 dias, tire no máximo 20 dias de descanso.",
  });
export type VacationInput = z.infer<typeof vacationInput>;

export const thirteenthInput = z
  .object({
    grossCents: salary,
    extrasCents: cents.default(0),
    admissionDate: date,
    year: z.number().int().min(2025).max(2100),
    dependents: dependents.default(0),
  })
  .strict();
export type ThirteenthInput = z.infer<typeof thirteenthInput>;

export const TERMINATION_TYPES = [
  "resignation",
  "without_cause",
  "with_cause",
  "agreement",
  "fixed_term_end",
] as const;
export type TerminationType = (typeof TERMINATION_TYPES)[number];

export const NOTICE_OPTIONS = ["worked", "paid", "waived", "not_served", "none"] as const;
export type NoticeOption = (typeof NOTICE_OPTIONS)[number];

export const terminationInput = z
  .object({
    grossCents: salary,
    extrasCents: cents.default(0),
    admissionDate: date,
    lastDay: date,
    type: z.enum(TERMINATION_TYPES),
    notice: z.enum(NOTICE_OPTIONS),
    overdueVacations: z.union([z.literal(0), z.literal(1), z.literal(2)]),
    fgtsBalanceCents: z.number().int().min(0).max(999_999_999).nullable(),
    anniversaryWithdrawal: z.boolean(),
    dependents: dependents.default(0),
  })
  .strict()
  .refine((v) => v.admissionDate <= v.lastDay, {
    path: ["lastDay"],
    message: "O último dia precisa ser depois da data de entrada.",
  });
export type TerminationInput = z.infer<typeof terminationInput>;

export const netSalaryInput = z
  .object({
    grossCents: salary,
    dependents: dependents.default(0),
    otherDiscountsCents: cents.default(0),
    /** Mês de referência ("hoje"), escolhe a tabela. */
    referenceDate: date,
    payDay: z.number().int().min(1).max(31).default(5),
  })
  .strict();
export type NetSalaryInput = z.infer<typeof netSalaryInput>;

export const unemploymentInput = z
  .object({
    type: z.enum(TERMINATION_TYPES),
    lastDay: date,
    salariesCents: z.tuple([salary, salary, salary]),
    monthsWorked36: z.number().int().min(0).max(36),
    previousRequests: z.union([z.literal(0), z.literal(1), z.literal(2)]),
    lastBenefitOver16Months: z.boolean(),
  })
  .strict();
export type UnemploymentInput = z.infer<typeof unemploymentInput>;
