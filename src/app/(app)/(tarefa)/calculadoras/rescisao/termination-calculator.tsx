"use client";

import Link from "next/link";

import { RadioCards } from "@/components/midas/choices";
import { useDrafts } from "@/components/midas/calculator/drafts";
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
import { buttonClasses } from "@/components/ui/button";
import { type DateOnly, formatShortDate, isDateOnly } from "@/lib/dates";
import { calculateTermination } from "@/lib/labor/calculators";
import { fullMonths } from "@/lib/labor/periods";
import type { NoticeOption, TerminationInput, TerminationType } from "@/lib/labor/schemas";
import { formatAmount } from "@/lib/money";

type Answers = {
  gross: string;
  admission: string;
  lastDay: string;
  type: TerminationType | null;
  notice: NoticeOption | null;
  overdue: 0 | 1 | 2;
  fgts: string;
  anniversary: "sim" | "nao" | "nao-sei";
  dependents: number;
};

const TYPES: Array<{ value: TerminationType; label: string; help: string }> = [
  { value: "resignation", label: "Pedi demissão", help: "Você avisou a empresa que ia sair." },
  {
    value: "without_cause",
    label: "Fui demitido ou demitida sem justa causa",
    help: "A empresa encerrou o contrato sem acusar falta grave.",
  },
  {
    value: "with_cause",
    label: "Fui demitido ou demitida por justa causa",
    help: "A empresa encerrou o contrato por uma falta grave.",
  },
  {
    value: "agreement",
    label: "Acordo com a empresa",
    help: "Vocês combinaram a saída: aviso pago e multa do FGTS pela metade.",
  },
  {
    value: "fixed_term_end",
    label: "Fim do contrato de experiência",
    help: "O contrato acabou na data combinada.",
  },
];

const NOTICE_LABELS: Record<NoticeOption, string> = {
  worked: "Trabalhei o aviso",
  paid: "A empresa pagou o aviso em dinheiro",
  waived: "A empresa me dispensou do aviso",
  not_served: "Não vou cumprir o aviso",
  none: "Sem aviso",
};

function noticeOptions(type: TerminationType | null): NoticeOption[] {
  if (type === "resignation") return ["worked", "waived", "not_served"];
  if (type === "without_cause" || type === "agreement") return ["worked", "paid"];
  return ["none"];
}

const shortDate = (d: string) =>
  isDateOnly(d) ? formatShortDate(new Date(`${d}T12:00:00Z`)) : "—";

export function TerminationCalculator({ today }: { today: DateOnly }) {
  const { setDraft } = useDrafts();
  const steps: WizardStep<Answers>[] = [
    {
      id: "salario",
      question: "Qual era o seu salário bruto?",
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
      id: "datas",
      question: "Quando você entrou e qual foi o último dia de trabalho?",
      render: ({ answers, set, errors }) => (
        <>
          <DateField
            label="Data de entrada"
            value={answers.admission}
            onChange={(admission) => set({ admission })}
            error={errors.admission}
          />
          <DateField
            label="Último dia de trabalho"
            value={answers.lastDay}
            onChange={(lastDay) => set({ lastDay })}
            error={errors.lastDay}
            min="2025-01-01"
          />
        </>
      ),
      validate: (a) => {
        const e: Record<string, string> = {};
        if (!isDateOnly(a.admission)) e.admission = "Escolha a data de entrada.";
        if (!isDateOnly(a.lastDay) || a.lastDay < "2025-01-01")
          e.lastDay = "Escolha uma data a partir de 2025.";
        else if (isDateOnly(a.admission) && a.lastDay < a.admission)
          e.lastDay = "O último dia precisa ser depois da entrada.";
        return Object.keys(e).length ? e : null;
      },
      review: (a) => `De ${shortDate(a.admission)} a ${shortDate(a.lastDay)}`,
    },
    {
      id: "tipo",
      question: "Como foi a saída?",
      render: ({ answers, set, errors }) => (
        <RadioCards
          legend="Escolha uma opção"
          name="tipo"
          value={answers.type}
          error={errors.type}
          onValueChange={(type) =>
            set({ type, notice: noticeOptions(type).length === 1 ? "none" : null })
          }
          options={TYPES}
        />
      ),
      validate: (a) => (a.type ? null : { type: "Escolha uma opção para continuar." }),
      review: (a) => TYPES.find((t) => t.value === a.type)?.label ?? "—",
    },
    {
      id: "aviso",
      question: "E o aviso prévio?",
      help: "O tempo entre avisar a saída e o último dia de trabalho. Pode ser trabalhado ou pago em dinheiro.",
      skip: (a) => noticeOptions(a.type).length === 1,
      render: ({ answers, set, errors }) => (
        <RadioCards
          legend="Escolha uma opção"
          name="aviso"
          value={answers.notice}
          error={errors.notice}
          onValueChange={(notice) => set({ notice })}
          options={noticeOptions(answers.type).map((value) => ({
            value,
            label: NOTICE_LABELS[value],
            help:
              value === "not_served" ? "A empresa pode descontar 30 dias de salário." : undefined,
          }))}
        />
      ),
      validate: (a) => (a.notice ? null : { notice: "Escolha uma opção para continuar." }),
      review: (a) => (a.notice ? NOTICE_LABELS[a.notice] : "—"),
    },
    {
      id: "ferias",
      question: "Você tem férias vencidas?",
      help: "Um ano inteiro de trabalho sem tirar as férias desse ano.",
      render: ({ answers, set }) => (
        <RadioCards
          legend="Escolha uma opção"
          name="vencidas"
          value={String(answers.overdue) as "0" | "1" | "2"}
          onValueChange={(v) => set({ overdue: Number(v) as 0 | 1 | 2 })}
          options={[
            { value: "0", label: "Não", help: "Tirei as férias de todos os anos completos." },
            { value: "1", label: "Sim, 1 período (30 dias)" },
            {
              value: "2",
              label: "Sim, 2 períodos",
              help: "O mais antigo passou do prazo e é pago em dobro.",
            },
          ]}
        />
      ),
      review: (a) => (a.overdue === 0 ? "Não" : a.overdue === 1 ? "1 período" : "2 períodos"),
    },
    {
      id: "fgts",
      question: "E o seu FGTS?",
      help: "Opcional. O saldo para fins rescisórios aparece no app do FGTS. Sem ele, o Midas estima.",
      render: ({ answers, set, errors }) => (
        <>
          <MoneyField
            label="Saldo do FGTS para fins rescisórios"
            value={answers.fgts}
            onChange={(fgts) => set({ fgts })}
            error={errors.fgts}
            help="Deixe em branco se não souber."
          />
          <RadioCards
            legend="Você aderiu ao saque-aniversário?"
            name="aniversario"
            value={answers.anniversary}
            onValueChange={(anniversary) => set({ anniversary })}
            options={[
              { value: "nao", label: "Não" },
              { value: "sim", label: "Sim", help: "Na demissão, só a multa pode ser sacada." },
              { value: "nao-sei", label: "Não sei", help: "O Midas considera que não." },
            ]}
          />
        </>
      ),
      validate: (a) => (moneyError(a.fgts, true) ? { fgts: moneyError(a.fgts, true)! } : null),
      review: (a) =>
        `${moneyReview(a.fgts, true) === "Nenhum" ? "Saldo estimado" : moneyReview(a.fgts)}${a.anniversary === "sim" ? ", com saque-aniversário" : ""}`,
    },
    {
      id: "dependentes",
      question: "Quantos dependentes você declara no Imposto de Renda?",
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
  const toInput = (a: Answers): TerminationInput => ({
    grossCents: cents(a.gross),
    extrasCents: 0,
    admissionDate: a.admission,
    lastDay: a.lastDay,
    type: a.type ?? "without_cause",
    notice: a.notice ?? "none",
    overdueVacations: a.overdue,
    fgtsBalanceCents: a.fgts.trim() ? cents(a.fgts) : null,
    anniversaryWithdrawal: a.anniversary === "sim",
    dependents: a.dependents,
  });
  return (
    <CalculatorWizard
      draftKey="rescisao"
      title="Rescisão"
      kind="TERMINATION"
      initial={{
        gross: "",
        admission: "",
        lastDay: today,
        type: null,
        notice: null,
        overdue: 0,
        fgts: "",
        anniversary: "nao",
        dependents: 0,
      }}
      steps={steps}
      toInput={toInput}
      compute={calculateTermination}
      headlineLabel="A empresa deve pagar cerca de"
      resultTitle={
        <>
          Sua rescisão, <em className="md-acento">explicada</em>.
        </>
      }
      extraActions={(a) =>
        a.type === "without_cause" ? (
          <Link
            href="/calculadoras/seguro-desemprego"
            className={buttonClasses({ variant: "secondary", fullWidth: true })}
            onClick={() => {
              const gross = formatAmount(cents(a.gross));
              setDraft("seguro-desemprego", {
                type: "without_cause",
                lastDay: a.lastDay,
                s1: gross,
                s2: gross,
                s3: gross,
                same: true,
                months: Math.min(36, fullMonths(a.admission, a.lastDay)),
              });
            }}
          >
            Ver o seguro-desemprego
          </Link>
        ) : null
      }
    />
  );
}
