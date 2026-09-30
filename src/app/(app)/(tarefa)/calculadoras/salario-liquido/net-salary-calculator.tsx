"use client";

import {
  cents,
  dependentsText,
  moneyError,
  MoneyField,
  moneyReview,
  NumberSelect,
} from "@/components/midas/calculator/fields";
import { CalculatorWizard, type WizardStep } from "@/components/midas/calculator/wizard";
import type { DateOnly } from "@/lib/dates";
import { calculateNetSalary } from "@/lib/labor/calculators";
import type { NetSalaryInput } from "@/lib/labor/schemas";

type Answers = { gross: string; dependents: number; other: string; payDay: number };

export function NetSalaryCalculator({ today }: { today: DateOnly }) {
  const steps: WizardStep<Answers>[] = [
    {
      id: "salario",
      question: "Qual é o seu salário bruto?",
      render: ({ answers, set, errors }) => (
        <MoneyField
          label="Salário bruto"
          value={answers.gross}
          onChange={(gross) => set({ gross })}
          error={errors.gross}
        />
      ),
      validate: (a) => (moneyError(a.gross) ? { gross: moneyError(a.gross)! } : null),
      review: (a) => moneyReview(a.gross),
    },
    {
      id: "dependentes",
      question: "Quantos dependentes você declara no Imposto de Renda?",
      help: "Filhos e outras pessoas que você pode declarar. Cada um diminui o imposto.",
      render: ({ answers, set }) => (
        <NumberSelect
          label="Dependentes"
          value={answers.dependents}
          onChange={(dependents) => set({ dependents })}
          from={0}
          to={10}
          format={dependentsText}
        />
      ),
      review: (a) => dependentsText(a.dependents),
    },
    {
      id: "outros",
      question: "Tem outros descontos no contracheque?",
      help: "Opcional: vale-transporte, plano de saúde, empréstimo. Some tudo.",
      render: ({ answers, set, errors }) => (
        <MoneyField
          label="Outros descontos por mês"
          value={answers.other}
          onChange={(other) => set({ other })}
          error={errors.other}
          help="Deixe em branco se não tiver."
        />
      ),
      validate: (a) => (moneyError(a.other, true) ? { other: moneyError(a.other, true)! } : null),
      review: (a) => moneyReview(a.other, true),
    },
    {
      id: "dia",
      question: "Que dia o salário costuma cair?",
      help: "Só para colocar o salário como renda fixa no planejamento.",
      render: ({ answers, set }) => (
        <NumberSelect
          label="Dia do pagamento"
          value={answers.payDay}
          onChange={(payDay) => set({ payDay })}
          from={1}
          to={31}
          format={(n) => `Dia ${n}`}
        />
      ),
      review: (a) => `Dia ${a.payDay}`,
    },
  ];
  const toInput = (a: Answers): NetSalaryInput => ({
    grossCents: cents(a.gross),
    dependents: a.dependents,
    otherDiscountsCents: cents(a.other, true),
    referenceDate: today,
    payDay: a.payDay,
  });
  return (
    <CalculatorWizard
      draftKey="salario-liquido"
      title="Salário líquido"
      kind="NET_SALARY"
      initial={{ gross: "", dependents: 0, other: "", payDay: 5 }}
      steps={steps}
      toInput={toInput}
      compute={calculateNetSalary}
      headlineLabel="Cai na sua conta cerca de"
      addLabel="Usar como renda fixa"
      resultTitle={
        <>
          Seu salário, <em className="md-acento">no bolso</em>.
        </>
      }
    />
  );
}
