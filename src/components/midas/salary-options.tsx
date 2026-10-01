"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import type { DateOnly } from "@/lib/dates";
import {
  ADVANCE_DAY,
  ADVANCE_PERCENTS,
  DEFAULT_ADVANCE_PERCENT,
  splitSalary,
} from "@/lib/finance/salary";
import { netSalaryFromGross } from "@/lib/labor/calculators";
import { MAX_SALARY_CENTS } from "@/lib/labor/types";
import { formatMoney } from "@/lib/money";

import { ChoiceChips } from "./choices";

/**
 * Opções do salário (docs/design-system/17-padroes-de-tela.md#salário): o valor é líquido
 * ou bruto, e cai num dia só ou dividido em adiantamento e resto. O caso mais comum já vem
 * marcado (líquido, num dia só); o resto só aparece quando a pessoa escolhe.
 */

export interface SalaryState {
  amountIs: "net" | "gross";
  split: boolean;
  advancePercent: number;
  advanceDay: number;
}

export const DEFAULT_SALARY: SalaryState = {
  amountIs: "net",
  split: false,
  advancePercent: DEFAULT_ADVANCE_PERCENT,
  advanceDay: ADVANCE_DAY,
};

/** O que vai para o servidor. */
export function salaryPayload(state: SalaryState) {
  return {
    amountIs: state.amountIs,
    split: state.split
      ? { advancePercent: state.advancePercent, advanceDay: state.advanceDay }
      : null,
  };
}

/** Líquido do valor digitado (o bruto vira líquido na hora, só para mostrar). */
export function netOf(cents: number | null, state: SalaryState, today: DateOnly): number | null {
  if (cents === null || cents < 1) return null;
  if (state.amountIs === "net") return cents;
  if (cents > MAX_SALARY_CENTS) return null;
  return netSalaryFromGross(cents, today).netCents;
}

const selectClass =
  "min-h-13 w-40 rounded-md border border-borda bg-superficie-funda px-4 text-body text-tinta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco";

export function SalaryOptions({
  idBase,
  amountCents,
  restDay,
  today,
  value,
  onChange,
  dayField,
}: {
  idBase: string;
  /** O valor digitado, ou null se ainda não for válido. */
  amountCents: number | null;
  /** Dia do salário (ou do resto, se dividido), escolhido no campo "Que dia?". */
  restDay: number;
  today: DateOnly;
  value: SalaryState;
  onChange: (next: SalaryState) => void;
  /** O campo "Que dia?" da tela, que vira "Dia do resto" quando dividido. */
  dayField: ReactNode;
}) {
  const set = (patch: Partial<SalaryState>) => onChange({ ...value, ...patch });
  const net = netOf(amountCents, value, today);
  const parts = net !== null && value.split ? splitSalary(net, value.advancePercent) : null;
  const percents: number[] = ADVANCE_PERCENTS.includes(
    value.advancePercent as (typeof ADVANCE_PERCENTS)[number],
  )
    ? [...ADVANCE_PERCENTS]
    : [...ADVANCE_PERCENTS, value.advancePercent].sort((a, b) => a - b);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <ChoiceChips<"net" | "gross">
          legend="Esse valor é:"
          name={`${idBase}-valor-e`}
          value={value.amountIs}
          onValueChange={(amountIs) => set({ amountIs })}
          options={[
            { value: "net", label: "Líquido (o que cai na conta)" },
            { value: "gross", label: "Bruto (do contracheque)" },
          ]}
        />
        {value.amountIs === "gross" ? (
          <>
            <p aria-live="polite" className="text-body text-tinta">
              {net !== null ? `Cai na conta cerca de ${formatMoney(net)}.` : null}
            </p>
            <p className="text-caption text-tinta-suave">
              Conta só o INSS e o Imposto de Renda, sem dependentes. Para detalhar, use a{" "}
              <Link href="/calculadoras/salario-liquido" className="md-link">
                calculadora de salário líquido
              </Link>
              . O Midas guarda só o líquido.
            </p>
          </>
        ) : null}
      </div>

      <div className="flex flex-col gap-3">
        <ChoiceChips<"single" | "split">
          legend="Como cai?"
          name={`${idBase}-como-cai`}
          value={value.split ? "split" : "single"}
          onValueChange={(v) => set({ split: v === "split" })}
          options={[
            { value: "single", label: "Tudo num dia" },
            { value: "split", label: "Dividido em dois" },
          ]}
        />
        {!value.split ? dayField : null}
        {value.split ? (
          <>
            <div className="flex flex-col gap-1">
              <label htmlFor={`${idBase}-adiantamento`} className="text-label text-tinta">
                Quanto vem no adiantamento?
              </label>
              <p id={`${idBase}-adiantamento-ajuda`} className="text-caption text-tinta-suave">
                Adiantamento é a parte do salário que a empresa paga antes, no meio do mês.
              </p>
              <select
                id={`${idBase}-adiantamento`}
                aria-describedby={`${idBase}-adiantamento-ajuda`}
                value={value.advancePercent}
                onChange={(event) => set({ advancePercent: Number(event.target.value) })}
                className={selectClass}
              >
                {percents.map((p) => (
                  <option key={p} value={p}>
                    {p}%
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor={`${idBase}-dia-adiantamento`} className="text-label text-tinta">
                Dia do adiantamento
              </label>
              <select
                id={`${idBase}-dia-adiantamento`}
                value={value.advanceDay}
                onChange={(event) => set({ advanceDay: Number(event.target.value) })}
                className={selectClass}
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    Dia {d}
                  </option>
                ))}
              </select>
            </div>
            {dayField}
            <p aria-live="polite" className="text-body text-tinta">
              {parts
                ? `${formatMoney(parts.advanceCents)} no dia ${value.advanceDay} e ${formatMoney(parts.restCents)} no dia ${restDay}.`
                : null}
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}
