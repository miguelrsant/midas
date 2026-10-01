import type { CalculatorKind } from "@/generated/prisma/client";

/** Nome de cada calculadora e a frase do valor principal no resultado. */
export const CALCULATOR_NAMES: Record<CalculatorKind, string> = {
  VACATION: "Férias",
  THIRTEENTH: "13º salário",
  TERMINATION: "Rescisão",
  NET_SALARY: "Salário líquido",
  UNEMPLOYMENT: "Seguro-desemprego",
};

export const HEADLINE_LABELS: Partial<Record<CalculatorKind, string>> = {
  TERMINATION: "A empresa deve pagar cerca de",
  NET_SALARY: "Cai na sua conta cerca de",
  UNEMPLOYMENT: "Cada parcela deve ser de cerca de",
};
