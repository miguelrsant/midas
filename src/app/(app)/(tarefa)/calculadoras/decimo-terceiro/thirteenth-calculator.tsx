"use client";

import {
  cents,
  DateField,
  dependentsText,
  moneyError,
  MoneyField,
  moneyReview,
  NumberSelect,
} from "@/components/midas/calculator/fields";
import { extrasStep, extrasCents } from "@/components/midas/calculator/extras-step";
import { CalculatorWizard, type WizardStep } from "@/components/midas/calculator/wizard";
import { type DateOnly, formatShortDate, isDateOnly } from "@/lib/dates";
import { calculateThirteenth } from "@/lib/labor/calculators";
import type { ThirteenthInput } from "@/lib/labor/schemas";

type Answers = {
  gross: string;
  admission: string;
  extras: string;
  hasExtras?: boolean;
  dependents: number;
  year: number;
};

const shortDate = (d: string) =>
  isDateOnly(d) ? formatShortDate(new Date(`${d}T12:00:00Z`)) : "—";

export function ThirteenthCalculator({ today }: { today: DateOnly }) {
  const year = Number(today.slice(0, 4));
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
      id: "admissao",
      question: "Desde quando você trabalha na empresa?",
      help: "Cada mês do ano com 15 dias ou mais de trabalho vale 1/12 do 13º.",
      render: ({ answers, set, errors }) => (
        <DateField
          label="Data de entrada"
          value={answers.admission}
          onChange={(admission) => set({ admission })}
          error={errors.admission}
          max={today}
        />
      ),
      validate: (a) =>
        isDateOnly(a.admission) && a.admission <= today
          ? null
          : { admission: "Escolha uma data até hoje." },
      review: (a) => shortDate(a.admission),
    },
    extrasStep<Answers>(),
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
  ];
  const toInput = (a: Answers): ThirteenthInput => ({
    grossCents: cents(a.gross),
    extrasCents: extrasCents(a),
    admissionDate: a.admission,
    year: a.year,
    dependents: a.dependents,
  });
  return (
    <CalculatorWizard
      draftKey="decimo-terceiro"
      title="13º salário"
      kind="THIRTEENTH"
      initial={{ gross: "", admission: "", extras: "", dependents: 0, year }}
      steps={steps}
      toInput={toInput}
      compute={calculateThirteenth}
      resultTitle={
        <>
          Seu 13º, <em className="md-acento">parte por parte</em>.
        </>
      }
    />
  );
}
