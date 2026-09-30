"use client";

import { RadioCards } from "@/components/midas/choices";
import {
  cents,
  DateField,
  moneyError,
  MoneyField,
  moneyReview,
  NumberSelect,
} from "@/components/midas/calculator/fields";
import { CalculatorWizard, type WizardStep } from "@/components/midas/calculator/wizard";
import { type DateOnly, formatShortDate, isDateOnly } from "@/lib/dates";
import { calculateUnemployment } from "@/lib/labor/calculators";
import type { TerminationType, UnemploymentInput } from "@/lib/labor/schemas";

type Answers = {
  type: TerminationType | null;
  lastDay: string;
  s1: string;
  s2: string;
  s3: string;
  same: boolean;
  months: number;
  requests: 0 | 1 | 2;
  over16: "sim" | "nao";
};

export function UnemploymentCalculator({ today }: { today: DateOnly }) {
  const steps: WizardStep<Answers>[] = [
    {
      id: "saida",
      question: "Como foi a saída do emprego?",
      help: "Só quem é dispensado sem justa causa tem direito ao seguro-desemprego.",
      render: ({ answers, set, errors }) => (
        <RadioCards
          legend="Escolha uma opção"
          name="saida"
          value={answers.type}
          error={errors.type}
          onValueChange={(type) => set({ type })}
          options={[
            { value: "without_cause", label: "Fui demitido ou demitida sem justa causa" },
            { value: "resignation", label: "Pedi demissão" },
            { value: "with_cause", label: "Fui demitido ou demitida por justa causa" },
            { value: "agreement", label: "Acordo com a empresa" },
            { value: "fixed_term_end", label: "Fim do contrato de experiência" },
          ]}
        />
      ),
      validate: (a) => (a.type ? null : { type: "Escolha uma opção para continuar." }),
      review: (a) => (a.type === "without_cause" ? "Sem justa causa" : "Outro tipo de saída"),
    },
    {
      id: "dia",
      question: "Qual foi o último dia de trabalho?",
      render: ({ answers, set, errors }) => (
        <DateField
          label="Último dia"
          value={answers.lastDay}
          onChange={(lastDay) => set({ lastDay })}
          error={errors.lastDay}
          min="2025-01-11"
        />
      ),
      validate: (a) =>
        isDateOnly(a.lastDay) && a.lastDay >= "2025-01-11"
          ? null
          : { lastDay: "Escolha uma data a partir de 11 de janeiro de 2025." },
      review: (a) =>
        isDateOnly(a.lastDay) ? formatShortDate(new Date(`${a.lastDay}T12:00:00Z`)) : "—",
    },
    {
      id: "salarios",
      question: "Qual foi o salário bruto nos 3 últimos meses?",
      help: "O valor da parcela sai da média dos três.",
      render: ({ answers, set, errors }) => (
        <>
          <label className="flex min-h-12 cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={answers.same}
              onChange={(e) => set({ same: e.target.checked, s2: answers.s1, s3: answers.s1 })}
              className="mt-1 size-5 accent-[var(--ouro)]"
            />
            <span className="text-label text-tinta">Foi o mesmo nos três meses</span>
          </label>
          <MoneyField
            label={answers.same ? "Salário" : "Último mês"}
            value={answers.s1}
            onChange={(s1) => set(answers.same ? { s1, s2: s1, s3: s1 } : { s1 })}
            error={errors.s1}
          />
          {!answers.same ? (
            <>
              <MoneyField
                label="Penúltimo mês"
                value={answers.s2}
                onChange={(s2) => set({ s2 })}
                error={errors.s2}
              />
              <MoneyField
                label="Antepenúltimo mês"
                value={answers.s3}
                onChange={(s3) => set({ s3 })}
                error={errors.s3}
              />
            </>
          ) : null}
        </>
      ),
      validate: (a) => {
        const e: Record<string, string> = {};
        for (const k of ["s1", "s2", "s3"] as const) if (moneyError(a[k])) e[k] = moneyError(a[k])!;
        return Object.keys(e).length ? e : null;
      },
      review: (a) =>
        a.same
          ? moneyReview(a.s1)
          : `${moneyReview(a.s1)}, ${moneyReview(a.s2)} e ${moneyReview(a.s3)}`,
    },
    {
      id: "meses",
      question: "Nos últimos 3 anos, quantos meses você trabalhou com carteira assinada?",
      help: "Conte todos os empregos. Os 3 anos inteiros são 36 meses.",
      render: ({ answers, set }) => (
        <NumberSelect
          label="Meses"
          value={answers.months}
          onChange={(months) => set({ months })}
          from={0}
          to={36}
          format={(n) => (n === 1 ? "1 mês" : `${n} meses`)}
        />
      ),
      review: (a) => `${a.months} meses`,
    },
    {
      id: "pedidos",
      question: "Você já recebeu o seguro-desemprego antes?",
      render: ({ answers, set }) => (
        <>
          <RadioCards
            legend="Quantas vezes?"
            name="pedidos"
            value={String(answers.requests) as "0" | "1" | "2"}
            onValueChange={(v) => set({ requests: Number(v) as 0 | 1 | 2 })}
            options={[
              { value: "0", label: "Nunca" },
              { value: "1", label: "Uma vez" },
              { value: "2", label: "Duas vezes ou mais" },
            ]}
          />
          {answers.requests > 0 ? (
            <RadioCards
              legend="Faz mais de 16 meses desde o último pedido?"
              name="carencia"
              value={answers.over16}
              onValueChange={(over16) => set({ over16 })}
              options={[
                { value: "sim", label: "Sim" },
                { value: "nao", label: "Não" },
              ]}
            />
          ) : null}
        </>
      ),
      review: (a) =>
        a.requests === 0 ? "Nunca" : a.requests === 1 ? "Uma vez" : "Duas vezes ou mais",
    },
  ];
  const toInput = (a: Answers): UnemploymentInput => ({
    type: a.type ?? "without_cause",
    lastDay: a.lastDay,
    salariesCents: [cents(a.s1), cents(a.same ? a.s1 : a.s2), cents(a.same ? a.s1 : a.s3)],
    monthsWorked36: a.months,
    previousRequests: a.requests,
    lastBenefitOver16Months: a.requests === 0 || a.over16 === "sim",
  });
  return (
    <CalculatorWizard
      draftKey="seguro-desemprego"
      title="Seguro-desemprego"
      kind="UNEMPLOYMENT"
      initial={{
        type: null,
        lastDay: today,
        s1: "",
        s2: "",
        s3: "",
        same: true,
        months: 12,
        requests: 0,
        over16: "sim",
      }}
      steps={steps}
      toInput={toInput}
      compute={calculateUnemployment}
      headlineLabel="Cada parcela deve ser de cerca de"
      resultTitle={
        <>
          Seu seguro, <em className="md-acento">mês a mês</em>.
        </>
      }
    />
  );
}
