import type { DateOnly } from "@/lib/dates";

/**
 * Salário aceito: até R$ 999.999,99 (a rescisão de 5 salários cabe em int4). Fica aqui,
 * sem Zod, para telas que só precisam do teto não levarem a Zod para o navegador.
 */
export const MAX_SALARY_CENTS = 99_999_999;

/** Versão das regras de cálculo; muda quando uma regra muda (a conta guardada leva a versão). */
export const LABOR_ENGINE_VERSION = 1;

export type LineSign = "+" | "-" | "=";

/** Uma linha de "De onde vem esse valor". */
export interface ResultLine {
  label: string;
  cents: number;
  sign: LineSign;
  /** Explicação curta, em caption. */
  note?: string;
}

/** Uma renda que entra no planejamento. */
export interface PlannedPayment {
  /** Rótulo gerado pelo sistema, nunca texto livre ("decimo-terceiro-1"). */
  labelKey: string;
  categoryId: "decimo-terceiro" | "ferias" | "rescisao" | "seguro-desemprego";
  cents: number;
  dueDate: DateOnly;
}

export interface LaborResult {
  /** Valor principal, "cerca de". */
  headlineCents: number;
  /** Frase do valor principal: "até 13 de dezembro", "em duas parcelas". */
  headlineNote: string;
  sections: Array<{ title: string; lines: ResultLine[] }>;
  payments: PlannedPayment[];
  /** Avisos em linguagem simples (sem direito, estimativas, suposições). */
  notes: string[];
  /** Ano das tabelas usadas, para "Tabelas de INSS e IR de 2026". */
  tableYear: number;
  /** A data passou da última tabela conhecida. */
  outdated: boolean;
}

/** Rótulos das rendas previstas, para a tela e a exportação. */
export const PAYMENT_LABELS: Record<string, string> = {
  "decimo-terceiro-1": "13º salário, 1ª parcela",
  "decimo-terceiro-2": "13º salário, 2ª parcela",
  ferias: "Férias",
  rescisao: "Rescisão",
  "rescisao-fgts": "Saque do FGTS",
  "seguro-desemprego-1": "Seguro-desemprego, 1ª parcela",
  "seguro-desemprego-2": "Seguro-desemprego, 2ª parcela",
  "seguro-desemprego-3": "Seguro-desemprego, 3ª parcela",
  "seguro-desemprego-4": "Seguro-desemprego, 4ª parcela",
  "seguro-desemprego-5": "Seguro-desemprego, 5ª parcela",
};

export function paymentLabel(labelKey: string): string {
  return PAYMENT_LABELS[labelKey] ?? "Renda prevista";
}
