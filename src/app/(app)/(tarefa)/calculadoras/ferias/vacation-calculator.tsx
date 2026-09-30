"use client";

import { RadioCards } from "@/components/midas/choices";
import {
  cents,
  DateField,
  dependentsText,
  moneyError,
  MoneyField,
  moneyReview,
  NumberSelect,
} from "@/components/midas/calculator/fields";
import { CalculatorWizard, type WizardStep } from "@/components/midas/calculator/wizard";
import { addDays, type DateOnly, formatDayMonth, isDateOnly } from "@/lib/dates";
import { calculateVacation } from "@/lib/labor/calculators";
import type { VacationInput } from "@/lib/labor/schemas";

type Answers = {
  gross: string;
  extras: string;
  plan: "30" | "20+10" | "outro";
  days: number;
  sellTen: boolean;
  start: string;
  dependents: number;
};

export function VacationCalculator({ today }: { today: DateOnly }) {
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
      id: "extras",
      question: "Qual a média de horas extras e adicionais?",
      help: "Opcional. A média dos últimos 12 meses, se você recebe. Deixe em branco se não recebe.",
      render: ({ answers, set, errors }) => (
        <MoneyField
          label="Média por mês"
          value={answers.extras}
          onChange={(extras) => set({ extras })}
          error={errors.extras}
          help="Deixe em branco se não recebe."
        />
      ),
      validate: (a) =>
        moneyError(a.extras, true) ? { extras: moneyError(a.extras, true)! } : null,
      review: (a) => moneyReview(a.extras, true),
    },
    {
      id: "dias",
      question: "Quantos dias de férias?",
      help: "Você pode trocar 10 dos 30 dias por dinheiro. Esse valor não tem desconto.",
      render: ({ answers, set, errors }) => (
        <>
          <RadioCards
            legend="Escolha uma opção"
            name="plano"
            value={answers.plan}
            onValueChange={(plan) =>
              set({
                plan,
                days: plan === "30" ? 30 : plan === "20+10" ? 20 : answers.days,
                sellTen: plan === "20+10",
              })
            }
            options={[
              { value: "30", label: "30 dias de descanso" },
              {
                value: "20+10",
                label: "20 dias de descanso e vender 10",
                help: "Os 10 dias viram dinheiro.",
              },
              {
                value: "outro",
                label: "Outro número de dias",
                help: "Férias divididas em partes.",
              },
            ]}
          />
          {answers.plan === "outro" ? (
            <>
              <NumberSelect
                label="Dias de descanso"
                value={answers.days}
                onChange={(days) => set({ days })}
                from={5}
                to={30}
                format={(n) => `${n} dias`}
              />
              <label className="flex min-h-12 cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={answers.sellTen}
                  onChange={(e) => set({ sellTen: e.target.checked })}
                  className="mt-1 size-5 accent-[var(--ouro)]"
                />
                <span className="text-label text-tinta">Vou vender 10 dias</span>
              </label>
              {errors.sellTen ? <p className="text-caption text-tinta">{errors.sellTen}</p> : null}
            </>
          ) : null}
        </>
      ),
      validate: (a) =>
        a.sellTen && a.days + 10 > 30
          ? { sellTen: "Para vender 10 dias, tire no máximo 20 dias de descanso." }
          : null,
      review: (a) => `${a.days} dias${a.sellTen ? " e vender 10" : ""}`,
    },
    {
      id: "inicio",
      question: "Quando começam as férias?",
      render: ({ answers, set, errors }) => (
        <DateField
          label="Primeiro dia de férias"
          value={answers.start}
          onChange={(start) => set({ start })}
          error={errors.start}
          min="2025-01-03"
        />
      ),
      validate: (a) =>
        isDateOnly(a.start) && a.start >= "2025-01-03"
          ? null
          : { start: "Escolha uma data a partir de 2025." },
      review: (a) => (isDateOnly(a.start) ? formatDayMonth(a.start) : "—"),
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
  ];
  const toInput = (a: Answers): VacationInput => ({
    grossCents: cents(a.gross),
    extrasCents: cents(a.extras, true),
    days: a.days,
    sellTen: a.sellTen,
    startDate: a.start,
    dependents: a.dependents,
  });
  return (
    <CalculatorWizard
      draftKey="ferias"
      title="Férias"
      kind="VACATION"
      initial={{
        gross: "",
        extras: "",
        plan: "30",
        days: 30,
        sellTen: false,
        start: addDays(today, 30),
        dependents: 0,
      }}
      steps={steps}
      toInput={toInput}
      compute={calculateVacation}
      resultTitle={
        <>
          Suas férias, <em className="md-acento">em números</em>.
        </>
      }
    />
  );
}
