"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";

import {
  createRecurringAction,
  deleteRecurringAction,
  updateRecurringAction,
} from "@/app/(app)/_actions/planning";
import {
  CategoryChips,
  ChoiceChips,
  RadioCards,
  SegmentedToggle,
} from "@/components/midas/choices";
import { ConfirmInline } from "@/components/midas/confirm-inline";
import { useAnnounce } from "@/components/midas/golden-touch";
import { MoneyInput } from "@/components/midas/money-input";
import {
  DEFAULT_SALARY,
  SalaryOptions,
  salaryPayload,
  type SalaryState,
} from "@/components/midas/salary-options";
import { Shortcuts } from "@/components/midas/shortcuts";
import { TaskHeader } from "@/components/midas/task-header";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { runAction, signInHref } from "@/lib/actions/client";
import type { Category } from "@/lib/categories";
import {
  addMonths,
  clampDay,
  type DateOnly,
  formatDayMonth,
  type MonthKey,
  monthName,
  monthOf,
  monthTitle,
} from "@/lib/dates";
import { DESCRIPTION_MAX_LENGTH, type EntryKind } from "@/lib/entry";
import { dayAlreadyPassed, MAX_INSTALLMENTS, type RepeatMode } from "@/lib/finance/recurring";
import { SALARY_DAY } from "@/lib/finance/salary";
import { formatAmount, MONEY_ERRORS, readMoney } from "@/lib/money";
import { HOME } from "@/lib/navigation";
import { findRecurringPreset, RECURRING_PRESETS } from "@/lib/presets";

/** Adicionar ou editar um fixo (docs/design-system/17-padroes-de-tela.md#rendas-e-gastos-fixos). */

type RepeatChoice = "monthly" | "installments" | "once";

export function RecurringForm({
  mode,
  today,
  categories,
  initial,
}: {
  mode: "new" | "edit";
  today: DateOnly;
  categories: { expense: Category[]; income: Category[] };
  initial: {
    id?: string;
    kind: EntryKind;
    presetId?: string | null;
    amountCents?: number;
    categoryId?: string | null;
    description?: string | null;
    dayOfMonth?: number;
    endMonth?: MonthKey | null;
    startMonth?: MonthKey;
    /** Salário: opções já escolhidas (na edição de um salário dividido). */
    salary?: SalaryState | null;
    /** É um salário com adiantamento: parar apaga os dois. */
    hasAdvance?: boolean;
  };
}) {
  const router = useRouter();
  const { announce } = useAnnounce();
  const id = useId();
  const preset = findRecurringPreset(initial.presetId);
  const [kind, setKind] = useState<EntryKind>(preset?.kind ?? initial.kind);
  const [amountText, setAmountText] = useState(
    initial.amountCents ? formatAmount(initial.amountCents) : "",
  );
  const [categoryId, setCategoryId] = useState<string | null>(
    preset?.categoryId ?? initial.categoryId ?? null,
  );
  const [name, setName] = useState(preset?.label ?? initial.description ?? "");
  const [day, setDay] = useState(preset?.day ?? initial.dayOfMonth ?? Number(today.slice(8, 10)));
  const [repeat, setRepeat] = useState<RepeatChoice>(
    preset?.installments ? "installments" : "monthly",
  );
  const [count, setCount] = useState("10");
  const [onceMonth, setOnceMonth] = useState<MonthKey>(addMonths(monthOf(today), 1));
  const [thisMonth, setThisMonth] = useState<"ja" | "agora" | null>(null);
  const [dayChosen, setDayChosen] = useState(Boolean(preset));
  const [salary, setSalary] = useState<SalaryState>(initial.salary ?? DEFAULT_SALARY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dirty, setDirty] = useState(false);
  const amountRef = useRef<HTMLInputElement>(null);
  const back = "/planejamento/fixos" as Route;

  const current = monthOf(today);
  // Salário: líquido ou bruto, e numa data só ou dividido (só renda fixa mensal em Salário).
  const showSalary =
    kind === "income" &&
    categoryId === "salario" &&
    (mode === "edit" ? !initial.endMonth : repeat === "monthly");
  const split = showSalary && salary.split;
  const typed = readMoney(amountText);
  const typedCents = typed.ok ? typed.cents : null;
  // Dividido, cada parte começa na sua próxima data: não há "Já anotou?".
  const passed = !split && dayAlreadyPassed(day, today);
  const startMonth: MonthKey =
    repeat === "once"
      ? onceMonth
      : passed
        ? thisMonth === "agora"
          ? current
          : addMonths(current, 1)
        : current;
  const firstDate = clampDay(startMonth, day);
  const list = categories[kind];
  const presets = RECURRING_PRESETS.filter((p) => p.kind === kind);
  const title =
    mode === "new"
      ? kind === "income"
        ? "Adicionar renda fixa"
        : "Adicionar gasto fixo"
      : kind === "income"
        ? "Editar renda fixa"
        : "Editar gasto fixo";

  async function save() {
    setFormError(null);
    const read = readMoney(amountText);
    const next: Record<string, string> = {};
    if (!read.ok) next.amountCents = MONEY_ERRORS[read.error];
    const n = Number(count);
    if (
      mode === "new" &&
      repeat === "installments" &&
      (!Number.isInteger(n) || n < 2 || n > MAX_INSTALLMENTS)
    ) {
      next.count = `Digite de 2 a ${MAX_INSTALLMENTS} meses.`;
    }
    if (mode === "new" && repeat !== "once" && passed && thisMonth === null) {
      next.thisMonth = `Diga se o de ${monthName(current)} já foi anotado.`;
    }
    setErrors(next);
    if (!read.ok || Object.keys(next).length > 0) {
      if (next.amountCents) amountRef.current?.focus();
      return;
    }
    const repeatMode: RepeatMode =
      repeat === "installments"
        ? { mode: "installments", count: n }
        : repeat === "once"
          ? { mode: "once" }
          : { mode: "monthly" };
    setBusy(true);
    const base = {
      kind,
      amountCents: read.cents,
      categoryId,
      description: name.trim() || null,
      dayOfMonth: day,
      salary: showSalary ? salaryPayload(salary) : null,
    };
    const result =
      mode === "new"
        ? await runAction(() => createRecurringAction({ ...base, startMonth, repeat: repeatMode }))
        : await runAction(() =>
            updateRecurringAction(initial.id, { ...base, endMonth: initial.endMonth ?? null }),
          );
    setBusy(false);
    if (!result.ok) {
      if (result.code === "session_expired") return router.push(signInHref() as Route);
      if (result.fields) setErrors(result.fields);
      else setFormError(result.message);
      return;
    }
    announce(result.data.message);
    router.replace(HOME);
  }

  async function stop() {
    if (!initial.id) return;
    setDeleting(true);
    const result = await runAction(() => deleteRecurringAction(initial.id));
    setDeleting(false);
    if (!result.ok) return setFormError(result.message);
    announce(result.data.message);
    router.replace(HOME);
  }

  const months = Array.from({ length: 24 }, (_, i) => addMonths(current, i));

  const dayField = (
    <div className="flex flex-col gap-1">
      <label htmlFor={`${id}-dia`} className="text-label text-tinta">
        {split ? "Dia do resto" : "Que dia?"}
      </label>
      <select
        id={`${id}-dia`}
        value={day}
        onChange={(event) => {
          setDay(Number(event.target.value));
          setDayChosen(true);
          setThisMonth(null);
          setDirty(true);
        }}
        className="min-h-13 w-40 rounded-md border border-borda bg-superficie-funda px-4 text-body text-tinta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco"
      >
        {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
          <option key={d} value={d}>
            Dia {d}
          </option>
        ))}
      </select>
      {day >= 29 ? (
        <p className="text-caption text-tinta-suave">
          Em meses com menos dias, entra no último dia.
        </p>
      ) : null}
    </div>
  );

  return (
    <>
      <TaskHeader title={title} backHref={back} dirty={dirty} />
      <form
        noValidate
        className="flex flex-col gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        {formError ? (
          <Notice tone="alerta" role="status">
            {formError}
          </Notice>
        ) : null}
        {mode === "new" ? (
          <SegmentedToggle
            value={kind}
            onValueChange={(k) => {
              setKind(k);
              setCategoryId(null);
              setDirty(true);
            }}
          />
        ) : null}
        {mode === "new" ? (
          <Shortcuts
            title="Comece por um modelo"
            help="Preenche nome, categoria e dia."
            items={presets}
            visibleCount={6}
            onPick={(p) => {
              setName(p.label);
              setCategoryId(p.categoryId);
              setDay(p.day);
              setDayChosen(true);
              if (p.installments) setRepeat("installments");
              setDirty(true);
              amountRef.current?.focus();
            }}
          />
        ) : null}
        <MoneyInput
          id={`${id}-valor`}
          label={
            showSalary && salary.amountIs === "gross"
              ? "Quanto é o salário bruto?"
              : kind === "income"
                ? "Quanto entra?"
                : "Quanto é?"
          }
          kind={kind}
          text={amountText}
          inputRef={amountRef}
          error={errors.amountCents}
          onTextChange={(t) => {
            setAmountText(t);
            setDirty(true);
          }}
          onBlur={() => {
            const read = readMoney(amountText);
            if (read.ok) setAmountText(formatAmount(read.cents));
          }}
        />
        <CategoryChips
          key={kind}
          categories={list}
          value={categoryId}
          onValueChange={(c) => {
            setCategoryId(c);
            // Salário costuma cair no dia 5: vira o padrão, se a pessoa ainda não escolheu o dia.
            if (mode === "new" && c === "salario" && !dayChosen) setDay(SALARY_DAY);
            setDirty(true);
          }}
        />
        {errors.categoryId ? <p className="text-caption text-tinta">{errors.categoryId}</p> : null}
        <TextField
          id={`${id}-nome`}
          label={
            <>
              Nome <span className="font-normal text-tinta-suave">(opcional)</span>
            </>
          }
          help={kind === "income" ? "Por exemplo: Salário da loja." : "Por exemplo: Aluguel."}
          maxLength={DESCRIPTION_MAX_LENGTH}
          value={name}
          error={errors.description}
          onChange={(event) => {
            setName(event.target.value);
            setDirty(true);
          }}
        />
        {showSalary ? (
          <SalaryOptions
            idBase={id}
            amountCents={typedCents}
            restDay={day}
            today={today}
            value={salary}
            onChange={(next) => {
              setSalary(next);
              setDirty(true);
            }}
            dayField={dayField}
          />
        ) : (
          dayField
        )}
        {mode === "new" ? (
          <>
            {!split ? (
              <ChoiceChips<RepeatChoice>
                legend="Repete"
                name="repete"
                value={repeat}
                onValueChange={(v) => {
                  setRepeat(v);
                  setDirty(true);
                }}
                options={[
                  { value: "monthly", label: "Todo mês" },
                  { value: "installments", label: "Por alguns meses" },
                  { value: "once", label: "Só uma vez" },
                ]}
              />
            ) : null}
            {repeat === "installments" ? (
              <TextField
                id={`${id}-meses`}
                label="Quantos meses?"
                help="Por exemplo, 10 para uma compra em 10 parcelas."
                inputMode="numeric"
                value={count}
                error={errors.count}
                onChange={(event) => setCount(event.target.value.replace(/\D/g, "").slice(0, 3))}
              />
            ) : null}
            {repeat === "once" ? (
              <div className="flex flex-col gap-1">
                <label htmlFor={`${id}-mes`} className="text-label text-tinta">
                  Em que mês?
                </label>
                <select
                  id={`${id}-mes`}
                  value={onceMonth}
                  onChange={(event) => setOnceMonth(event.target.value)}
                  className="min-h-13 w-60 rounded-md border border-borda bg-superficie-funda px-4 text-body text-tinta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco"
                >
                  {months.map((m) => (
                    <option key={m} value={m}>
                      {monthTitle(m)}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            {repeat !== "once" && passed ? (
              <RadioCards<"ja" | "agora">
                legend={`Já anotou o de ${monthName(current)}?`}
                name="este-mes"
                value={thisMonth}
                error={errors.thisMonth}
                onValueChange={setThisMonth}
                options={[
                  { value: "ja", label: "Já anotei", help: "Começa no mês que vem." },
                  {
                    value: "agora",
                    label: "Anotar agora",
                    help: `Anota o de ${monthName(current)} também.`,
                  },
                ]}
              />
            ) : null}
            {!split ? (
              <p aria-live="polite" className="text-body text-tinta">
                A primeira vez entra em {formatDayMonth(firstDate)}.
              </p>
            ) : null}
          </>
        ) : (
          <Notice tone="info">
            Mudanças valem dali para a frente. O que já foi anotado não muda.
          </Notice>
        )}
        <Button type="submit" size="lg" fullWidth busy={busy} busyLabel="Salvando…">
          {mode === "edit"
            ? "Salvar alterações"
            : kind === "income"
              ? "Salvar renda fixa"
              : "Salvar gasto fixo"}
        </Button>
        {mode === "edit" ? (
          <div className="border-t border-veio pt-6">
            <ConfirmInline
              trigger="Parar este fixo"
              question={
                initial.hasAdvance
                  ? "Parar o salário e o adiantamento? O que já foi anotado continua na lista."
                  : `Parar “${initial.description || "este fixo"}”? O que já foi anotado continua na lista.`
              }
              confirmLabel="Parar este fixo"
              keepLabel="Manter fixo"
              busy={deleting}
              busyLabel="Parando…"
              onConfirm={() => void stop()}
            />
          </div>
        ) : null}
      </form>
    </>
  );
}
