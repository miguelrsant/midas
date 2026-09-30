"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";

import { saveStarterPlanAction } from "@/app/(app)/_actions/planning";
import { CheckboxField } from "@/components/midas/checkbox-field";
import { useAnnounce } from "@/components/midas/golden-touch";
import { MoneyInput } from "@/components/midas/money-input";
import { TaskHeader } from "@/components/midas/task-header";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { runAction, signInHref } from "@/lib/actions/client";
import { type DateOnly, monthName } from "@/lib/dates";
import { dayAlreadyPassed } from "@/lib/finance/recurring";
import { formatAmount, formatMoney, MONEY_ERRORS, readMoney } from "@/lib/money";
import { RECURRING_PRESETS, type RecurringPreset } from "@/lib/presets";

/**
 * "Monte seu mês" (docs/design-system/17-padroes-de-tela.md#monte-seu-mês): renda fixa e
 * gastos fixos prontos, em passos curtos. Cada passo pode ser pulado.
 */

type Row = {
  preset: RecurringPreset;
  text: string;
  day: number;
  installments: string;
  happened: boolean;
  error?: string;
};

const EXPENSE_PRESETS = RECURRING_PRESETS.filter((p) => p.kind === "expense");
const TOTAL = 5;

export function StarterWizard({ today, month }: { today: DateOnly; month: string }) {
  const router = useRouter();
  const { announce } = useAnnounce();
  const id = useId();
  const [step, setStep] = useState(1);
  const [incomeText, setIncomeText] = useState("");
  const [incomeDay, setIncomeDay] = useState(5);
  const [variableIncome, setVariableIncome] = useState(false);
  const [incomeError, setIncomeError] = useState<string | null>(null);
  const [chosen, setChosen] = useState<string[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const incomeRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const passed = rows.filter((r) => dayAlreadyPassed(r.day, today));
  const incomeRead = readMoney(incomeText);
  const incomeCents = incomeRead.ok ? incomeRead.cents : 0;
  // O passo 4 só existe se algum gasto já passou do dia neste mês.
  const skipHappened = passed.length === 0;

  function go(next: number) {
    setStep(next);
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  function nextFromIncome() {
    if (!variableIncome) {
      const read = readMoney(incomeText);
      if (!read.ok) {
        setIncomeError(MONEY_ERRORS[read.error]);
        incomeRef.current?.focus();
        return;
      }
      setIncomeText(formatAmount(read.cents));
    }
    setIncomeError(null);
    go(2);
  }

  function nextFromChoice() {
    setRows((prev) =>
      chosen.map((pid) => {
        const existing = prev.find((r) => r.preset.id === pid);
        const preset = EXPENSE_PRESETS.find((p) => p.id === pid)!;
        return (
          existing ?? { preset, text: "", day: preset.day, installments: "10", happened: false }
        );
      }),
    );
    go(chosen.length === 0 ? 5 : 3);
  }

  function nextFromValues() {
    let ok = true;
    setRows((prev) =>
      prev.map((r) => {
        const read = readMoney(r.text);
        const n = Number(r.installments);
        const error = !read.ok
          ? MONEY_ERRORS[read.error]
          : r.preset.installments && (!Number.isInteger(n) || n < 2 || n > 120)
            ? "Digite de 2 a 120 parcelas."
            : undefined;
        if (error) ok = false;
        return { ...r, error, text: read.ok ? formatAmount(read.cents) : r.text };
      }),
    );
    if (ok) go(skipHappened ? 5 : 4);
  }

  async function save() {
    setBusy(true);
    setFormError(null);
    const income = variableIncome ? null : readMoney(incomeText);
    const result = await runAction(() =>
      saveStarterPlanAction({
        income: income && income.ok ? { amountCents: income.cents, dayOfMonth: incomeDay } : null,
        expenses: rows.map((r) => {
          const read = readMoney(r.text);
          return {
            presetLabel: r.preset.label,
            categoryId: r.preset.categoryId,
            amountCents: read.ok ? read.cents : 0,
            dayOfMonth: r.day,
            installments: r.preset.installments ? Number(r.installments) : null,
            alreadyHappened: r.happened,
          };
        }),
      }),
    );
    setBusy(false);
    if (!result.ok) {
      if (result.code === "session_expired") return router.push(signInHref() as Route);
      return setFormError(result.message);
    }
    announce(result.data.message);
    router.push("/");
  }

  const back = () => {
    if (step === 1) return false;
    if (step === 5) go(chosen.length === 0 ? 2 : skipHappened ? 3 : 4);
    else go(step - 1);
    return true;
  };

  const daySelect = (value: number, onChange: (d: number) => void, label: string, key: string) => (
    <div className="flex flex-col gap-1">
      <label htmlFor={key} className="text-label text-tinta">
        {label}
      </label>
      <select
        id={key}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="min-h-12 w-36 rounded-md border border-borda bg-superficie-funda px-3 text-body text-tinta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco"
      >
        {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
          <option key={d} value={d}>
            Dia {d}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <>
      <TaskHeader
        title="Monte seu mês"
        backHref="/"
        onBack={back}
        step={{ current: step, total: TOTAL }}
      />
      {formError ? (
        <Notice tone="alerta" role="status" className="mb-4">
          {formError}
        </Notice>
      ) : null}

      {step === 1 ? (
        <section className="flex flex-col gap-6">
          <h2 ref={headingRef} tabIndex={-1} className="text-title text-tinta focus:outline-none">
            Quanto você recebe por mês?
          </h2>
          {!variableIncome ? (
            <>
              <MoneyInput
                id={`${id}-renda`}
                label="Renda do mês (o que cai na conta)"
                kind="income"
                text={incomeText}
                inputRef={incomeRef}
                focusOnMount
                error={incomeError}
                onTextChange={setIncomeText}
              />
              {daySelect(incomeDay, setIncomeDay, "Que dia cai?", `${id}-dia-renda`)}
              <p className="text-caption text-tinta-suave">
                Não sabe o líquido?{" "}
                <Link href="/calculadoras/salario-liquido" className="md-link">
                  Calcule pelo salário bruto
                </Link>
                .
              </p>
            </>
          ) : null}
          <CheckboxField
            label="Minha renda muda todo mês"
            help="Você anota cada renda quando ela entrar."
            checked={variableIncome}
            onChange={setVariableIncome}
          />
          <Button size="lg" fullWidth onClick={nextFromIncome}>
            Continuar
          </Button>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="flex flex-col gap-6">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-3">
              <h2
                ref={headingRef}
                tabIndex={-1}
                className="text-title text-tinta focus:outline-none"
              >
                Quais destes gastos você tem todo mês?
              </h2>
            </legend>
            {EXPENSE_PRESETS.map((p) => (
              <label
                key={p.id}
                className="flex min-h-12 cursor-pointer items-center gap-3 rounded-md border border-borda bg-superficie px-4 has-[:checked]:border-2 has-[:checked]:border-ouro has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-foco"
              >
                <input
                  type="checkbox"
                  checked={chosen.includes(p.id)}
                  onChange={(event) =>
                    setChosen((c) =>
                      event.target.checked ? [...c, p.id] : c.filter((x) => x !== p.id),
                    )
                  }
                  className="size-5 flex-none accent-[var(--ouro)]"
                />
                <span className="text-body text-tinta">{p.label}</span>
              </label>
            ))}
          </fieldset>
          <Button size="lg" fullWidth onClick={nextFromChoice}>
            {chosen.length === 0 ? "Nenhum destes, continuar" : "Continuar"}
          </Button>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="flex flex-col gap-6">
          <h2 ref={headingRef} tabIndex={-1} className="text-title text-tinta focus:outline-none">
            Quanto é e que dia vence?
          </h2>
          {rows.map((r, i) => (
            <div
              key={r.preset.id}
              className="flex flex-col gap-3 rounded-md border border-veio bg-superficie p-4"
            >
              <MoneyInput
                id={`${id}-${r.preset.id}`}
                label={r.preset.label}
                kind="expense"
                text={r.text}
                inputRef={{ current: null }}
                error={r.error}
                onTextChange={(t) =>
                  setRows((all) =>
                    all.map((x, j) => (j === i ? { ...x, text: t, error: undefined } : x)),
                  )
                }
              />
              {daySelect(
                r.day,
                (d) => setRows((all) => all.map((x, j) => (j === i ? { ...x, day: d } : x))),
                "Que dia vence?",
                `${id}-${r.preset.id}-dia`,
              )}
              {r.preset.installments ? (
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor={`${id}-${r.preset.id}-parcelas`}
                    className="text-label text-tinta"
                  >
                    Quantas parcelas faltam?
                  </label>
                  <input
                    id={`${id}-${r.preset.id}-parcelas`}
                    inputMode="numeric"
                    value={r.installments}
                    onChange={(event) =>
                      setRows((all) =>
                        all.map((x, j) =>
                          j === i
                            ? {
                                ...x,
                                installments: event.target.value.replace(/\D/g, "").slice(0, 3),
                              }
                            : x,
                        ),
                      )
                    }
                    className="min-h-12 w-24 rounded-md border border-borda bg-superficie-funda px-3 text-body text-tinta focus-visible:outline-2 focus-visible:outline-foco"
                  />
                </div>
              ) : null}
            </div>
          ))}
          <Button size="lg" fullWidth onClick={nextFromValues}>
            Continuar
          </Button>
        </section>
      ) : null}

      {step === 4 ? (
        <section className="flex flex-col gap-6">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-3">
              <h2
                ref={headingRef}
                tabIndex={-1}
                className="text-title text-tinta focus:outline-none"
              >
                Algum já foi pago em {monthName(month)}?
              </h2>
              <span className="block text-caption text-tinta-suave">
                Marque os que já foram pagos: o Midas anota agora. Os outros começam no mês que vem.
              </span>
            </legend>
            {passed.map((r) => (
              <label
                key={r.preset.id}
                className="flex min-h-12 cursor-pointer items-center gap-3 rounded-md border border-borda bg-superficie px-4 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-foco"
              >
                <input
                  type="checkbox"
                  checked={r.happened}
                  onChange={(event) =>
                    setRows((all) =>
                      all.map((x) =>
                        x.preset.id === r.preset.id ? { ...x, happened: event.target.checked } : x,
                      ),
                    )
                  }
                  className="size-5 flex-none accent-[var(--ouro)]"
                />
                <span className="text-body text-tinta">
                  {r.preset.label} (dia {r.day})
                </span>
              </label>
            ))}
          </fieldset>
          <Button size="lg" fullWidth onClick={() => go(5)}>
            Continuar
          </Button>
        </section>
      ) : null}

      {step === 5 ? (
        <section className="flex flex-col gap-6">
          <h2 ref={headingRef} tabIndex={-1} className="text-title text-tinta focus:outline-none">
            Confira seu mês
          </h2>
          <dl className="flex flex-col divide-y divide-veio rounded-md border border-veio bg-superficie">
            <div className="flex items-center justify-between gap-3 p-4">
              <dt className="text-body text-tinta">
                Renda{variableIncome ? "" : `, todo dia ${incomeDay}`}
              </dt>
              <dd className="flex items-center gap-3">
                <span className="text-amount">
                  {variableIncome ? "Muda todo mês" : `+ ${formatMoney(incomeCents)}`}
                </span>
                <Button variant="ghost" size="sm" onClick={() => go(1)}>
                  Alterar<span className="md-sr"> renda</span>
                </Button>
              </dd>
            </div>
            {rows.map((r) => {
              const read = readMoney(r.text);
              return (
                <div key={r.preset.id} className="flex items-center justify-between gap-3 p-4">
                  <dt className="text-body text-tinta">
                    {r.preset.label}, dia {r.day}
                    {r.preset.installments ? ` (${r.installments} parcelas)` : ""}
                  </dt>
                  <dd className="flex items-center gap-3">
                    <span className="text-amount">− {formatMoney(read.ok ? read.cents : 0)}</span>
                    <Button variant="ghost" size="sm" onClick={() => go(3)}>
                      Alterar<span className="md-sr"> {r.preset.label}</span>
                    </Button>
                  </dd>
                </div>
              );
            })}
          </dl>
          <Button size="lg" fullWidth busy={busy} busyLabel="Salvando…" onClick={() => void save()}>
            Salvar meu mês
          </Button>
        </section>
      ) : null}
    </>
  );
}
