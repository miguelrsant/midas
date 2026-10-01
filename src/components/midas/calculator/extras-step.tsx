"use client";

import { RadioCards } from "@/components/midas/choices";

import { cents, MoneyField, moneyError, moneyReview } from "./fields";
import type { WizardStep } from "./wizard";

/**
 * Passo "hora extra e adicionais" das férias e do 13º: primeiro um sim ou não, com
 * "Não recebo" já marcado; o valor só é pedido de quem recebe.
 */

export interface ExtrasAnswers {
  extras: string;
  /** Rascunhos antigos não têm: vale o que foi digitado. */
  hasExtras?: boolean;
}

export const receivesExtras = (a: ExtrasAnswers) => a.hasExtras ?? a.extras.trim() !== "";

/** Centavos da média de extras (0 para quem não recebe). */
export const extrasCents = (a: ExtrasAnswers) => (receivesExtras(a) ? cents(a.extras, true) : 0);

export function extrasStep<A extends ExtrasAnswers>(): WizardStep<A> {
  return {
    id: "extras",
    question: "Você recebe hora extra ou adicional?",
    help: "Adicional é o que vem a mais no salário: noturno, insalubridade, periculosidade, comissão.",
    render: ({ answers, set, errors }) => (
      <>
        <RadioCards<"nao" | "sim">
          legend="Escolha uma opção"
          name="extras"
          value={receivesExtras(answers) ? "sim" : "nao"}
          onValueChange={(v) => set({ hasExtras: v === "sim" } as Partial<A>)}
          options={[
            { value: "nao", label: "Não recebo" },
            {
              value: "sim",
              label: "Recebo",
              help: "Hora extra, adicional noturno ou outro valor que muda o salário.",
            },
          ]}
        />
        {receivesExtras(answers) ? (
          <MoneyField
            label="Quanto vem a mais, em média, por mês?"
            value={answers.extras}
            onChange={(extras) => set({ extras } as Partial<A>)}
            error={errors.extras}
            help="Some o que veio a mais nos últimos meses e divida pelo número de meses."
          />
        ) : null}
      </>
    ),
    validate: (a) => {
      if (!receivesExtras(a)) return null;
      const problem = moneyError(a.extras);
      return problem ? { extras: problem } : null;
    },
    review: (a) => (receivesExtras(a) ? `${moneyReview(a.extras)} por mês` : "Não recebe"),
  };
}
