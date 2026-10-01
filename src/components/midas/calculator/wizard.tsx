"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { addToPlanAction } from "@/app/(app)/_actions/calculators";
import { useAnnounce } from "@/components/midas/golden-touch";
import { TaskHeader } from "@/components/midas/task-header";
import { Button, buttonClasses } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { runAction, signInHref } from "@/lib/actions/client";
import { HOME } from "@/lib/navigation";
import { LaborInputError } from "@/lib/labor/errors";
import type { LaborResult } from "@/lib/labor/types";

import { useDrafts } from "./drafts";
import { ResultView } from "./result-view";

/**
 * Passo a passo das calculadoras (docs/design-system/17-padroes-de-tela.md#passo-a-passo):
 * uma pergunta por tela, "Passo N de M", "Confira suas respostas" com "Alterar" e o
 * resultado calculado no próprio aparelho. Nada vai ao servidor até "Adicionar ao planejamento".
 */

export interface StepContext<A> {
  answers: A;
  set: (patch: Partial<A>) => void;
  errors: Record<string, string>;
}

export interface WizardStep<A> {
  id: string;
  question: string;
  help?: string;
  skip?: (a: A) => boolean;
  render: (ctx: StepContext<A>) => ReactNode;
  validate?: (a: A) => Record<string, string> | null;
  /** Linha de "Confira suas respostas". */
  review: (a: A) => string;
}

export function CalculatorWizard<A extends Record<string, unknown>, I>({
  draftKey,
  title,
  initial,
  steps,
  toInput,
  compute,
  kind,
  resultTitle,
  headlineLabel,
  addLabel = "Adicionar ao planejamento",
  extraActions,
}: {
  draftKey: string;
  title: string;
  initial: A;
  steps: WizardStep<A>[];
  toInput: (a: A) => I;
  compute: (input: I) => LaborResult;
  kind: "VACATION" | "THIRTEENTH" | "TERMINATION" | "NET_SALARY" | "UNEMPLOYMENT";
  resultTitle: ReactNode;
  headlineLabel?: string;
  addLabel?: string;
  extraActions?: (answers: A) => ReactNode;
}) {
  const router = useRouter();
  const { announce } = useAnnounce();
  const { drafts, setDraft } = useDrafts();
  const [answers, setAnswers] = useState<A>(() => ({
    ...initial,
    ...(drafts[draftKey] as Partial<A> | undefined),
  }));
  const [index, setIndex] = useState(0); // steps.length = revisão, +1 = resultado
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [calcId, setCalcId] = useState(() => crypto.randomUUID());
  const [serverError, setServerError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const active = steps.filter((s) => !s.skip?.(answers));
  const review = active.length;
  const resultIndex = active.length + 1;

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [index]);

  const set = (patch: Partial<A>) => {
    setAnswers((a) => {
      const next = { ...a, ...patch };
      setDraft(draftKey, next);
      return next;
    });
  };

  function next() {
    const step = active[index];
    const problems = step?.validate?.(answers) ?? null;
    if (problems && Object.keys(problems).length > 0) {
      setErrors(problems);
      return;
    }
    setErrors({});
    setIndex((i) => i + 1);
  }

  let result: LaborResult | null = null;
  let resultError: string | null = null;
  if (index === resultIndex) {
    try {
      result = compute(toInput(answers));
    } catch (error) {
      resultError =
        error instanceof LaborInputError
          ? error.message
          : "Não deu para calcular com essas respostas.";
    }
  }

  async function addToPlan() {
    setBusy(true);
    setServerError(null);
    const response = await runAction(() =>
      addToPlanAction({ id: calcId, kind, input: toInput(answers) }),
    );
    if (!response.ok) {
      setBusy(false);
      if (response.code === "session_expired") return router.push(signInHref() as Route);
      setServerError(response.message);
      return;
    }
    announce(response.data.message);
    router.push(HOME);
  }

  const onBack = () => {
    if (index === 0) return false;
    setErrors({});
    setIndex((i) => i - 1);
    return true;
  };

  const stepNumber = Math.min(index + 1, review);
  return (
    <>
      <TaskHeader
        title={title}
        backHref="/calculadoras"
        onBack={onBack}
        step={index < review ? { current: stepNumber, total: review } : undefined}
      />
      {index < review ? (
        <form
          noValidate
          className="flex flex-col gap-6"
          onSubmit={(event) => {
            event.preventDefault();
            next();
          }}
        >
          <h2 ref={headingRef} tabIndex={-1} className="text-title text-tinta focus:outline-none">
            {active[index]!.question}
          </h2>
          {active[index]!.help ? (
            <p className="-mt-4 text-caption text-tinta-suave">{active[index]!.help}</p>
          ) : null}
          {active[index]!.render({ answers, set, errors })}
          <Button type="submit" size="lg" fullWidth>
            Continuar
          </Button>
        </form>
      ) : null}

      {index === review ? (
        <section className="flex flex-col gap-6">
          <h2 ref={headingRef} tabIndex={-1} className="text-title text-tinta focus:outline-none">
            Confira suas respostas
          </h2>
          <dl className="flex flex-col divide-y divide-veio rounded-md border border-veio bg-superficie">
            {active.map((step, i) => (
              <div key={step.id} className="flex items-start justify-between gap-3 p-4">
                <div>
                  <dt className="text-caption text-tinta-suave">{step.question}</dt>
                  <dd className="text-body text-tinta">{step.review(answers)}</dd>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIndex(i)}>
                  Alterar<span className="md-sr">: {step.question}</span>
                </Button>
              </div>
            ))}
          </dl>
          <Button
            size="lg"
            fullWidth
            onClick={() => {
              setCalcId(crypto.randomUUID());
              setIndex(resultIndex);
            }}
          >
            Ver o resultado
          </Button>
        </section>
      ) : null}

      {index === resultIndex ? (
        <section className="flex flex-col gap-6" aria-labelledby="resultado">
          <h2 id="resultado" ref={headingRef} tabIndex={-1} className="md-sr">
            Resultado
          </h2>
          {result ? (
            <>
              <ResultView result={result} title={resultTitle} headlineLabel={headlineLabel} />
              {serverError ? (
                <Notice tone="alerta" role="status">
                  {serverError}
                </Notice>
              ) : null}
              {kind === "NET_SALARY" || result.payments.length > 0 ? (
                <Button
                  size="lg"
                  fullWidth
                  busy={busy}
                  busyLabel="Adicionando…"
                  onClick={() => void addToPlan()}
                >
                  {addLabel}
                </Button>
              ) : null}
              {extraActions?.(answers)}
            </>
          ) : (
            <Notice tone="info" role="status">
              {resultError}
            </Notice>
          )}
          <Button variant="secondary" fullWidth onClick={() => setIndex(0)}>
            Refazer as contas
          </Button>
          <Link href="/calculadoras" className={buttonClasses({ variant: "ghost" })}>
            Voltar para as calculadoras
          </Link>
        </section>
      ) : null}
    </>
  );
}
