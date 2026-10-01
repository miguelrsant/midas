"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";

import {
  createEntryAction,
  deleteEntryAction,
  updateEntryAction,
} from "@/app/(app)/_actions/entries";
import { CheckboxField } from "@/components/midas/checkbox-field";
import { CategoryChips, ChoiceChips, SegmentedToggle } from "@/components/midas/choices";
import { ConfirmInline } from "@/components/midas/confirm-inline";
import { useAnnounce, useRipple } from "@/components/midas/golden-touch";
import { MoneyInput } from "@/components/midas/money-input";
import { Shortcuts } from "@/components/midas/shortcuts";
import { TaskHeader } from "@/components/midas/task-header";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { runAction, signInHref } from "@/lib/actions/client";
import type { Category } from "@/lib/categories";
import { addDays, type DateOnly, monthOf } from "@/lib/dates";
import { DESCRIPTION_MAX_LENGTH, type EntryKind } from "@/lib/entry";
import { MAX_INSTALLMENTS } from "@/lib/finance/recurring";
import { formatAmount, formatSigned, MONEY_ERRORS, readMoney } from "@/lib/money";
import { homeFor } from "@/lib/navigation";
import { SHORTCUTS } from "@/lib/presets";

/**
 * Formulário de lançamento (docs/design-system/17-padroes-de-tela.md#adicionar-lançamento).
 * Só o valor é obrigatório. Erros aparecem ao salvar, e o foco vai para o primeiro campo
 * com erro. Salvar um lançamento novo toca o toque de ouro; salvar ou excluir volta ao
 * Início, no mês do lançamento. "Voltar" sem salvar vai para a tela de origem.
 */

type WhenChoice = "hoje" | "ontem" | "outro";

export interface EntryFormProps {
  mode: "new" | "edit";
  today: DateOnly;
  categories: { expense: Category[]; income: Category[] };
  backHref: Route;
  initial: {
    id?: string;
    kind: EntryKind;
    amountCents?: number;
    categoryId?: string | null;
    description?: string | null;
    date?: DateOnly;
    recurringId?: string | null;
  };
}

function initialWhen(date: DateOnly | undefined, today: DateOnly): WhenChoice {
  if (!date || date === today) return "hoje";
  if (date === addDays(today, -1)) return "ontem";
  return "outro";
}

export function EntryForm({ mode, today, categories, backHref, initial }: EntryFormProps) {
  const router = useRouter();
  const { announce, highlight } = useAnnounce();
  const ripple = useRipple();
  const idBase = useId();
  const [newId] = useState(() => crypto.randomUUID());
  const [kind, setKind] = useState<EntryKind>(initial.kind);
  const [amountText, setAmountText] = useState(
    initial.amountCents ? formatAmount(initial.amountCents) : "",
  );
  const [categoryId, setCategoryId] = useState<string | null>(initial.categoryId ?? null);
  const [description, setDescription] = useState(initial.description ?? "");
  const [when, setWhen] = useState<WhenChoice>(initialWhen(initial.date, today));
  const [otherDate, setOtherDate] = useState<string>(
    initial.date && initialWhen(initial.date, today) === "outro" ? initial.date : today,
  );
  const [repeat, setRepeat] = useState(false);
  const [repeatUntil, setRepeatUntil] = useState<"forever" | "months">("forever");
  const [repeatCount, setRepeatCount] = useState("10");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dirty, setDirty] = useState(false);
  const amountRef = useRef<HTMLInputElement>(null);
  const saveRef = useRef<HTMLButtonElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);

  const touch = () => setDirty(true);
  const list = categories[kind];
  const shortcuts = SHORTCUTS.filter(
    (s) => s.kind === kind && list.some((c) => c.id === s.categoryId),
  );
  const date: string = when === "hoje" ? today : when === "ontem" ? addDays(today, -1) : otherDate;
  const title =
    mode === "new"
      ? kind === "income"
        ? "Adicionar renda"
        : "Adicionar gasto"
      : kind === "income"
        ? "Editar renda"
        : "Editar gasto";

  async function save() {
    setFormError(null);
    const read = readMoney(amountText);
    const nextErrors: Record<string, string> = {};
    if (!read.ok) nextErrors.amountCents = MONEY_ERRORS[read.error];
    const count = Number(repeatCount);
    const limited = repeat && repeatUntil === "months";
    if (limited && (!Number.isInteger(count) || count < 2 || count > MAX_INSTALLMENTS)) {
      nextErrors.repeatCount = `Digite de 2 a ${MAX_INSTALLMENTS} meses.`;
    }
    if (when === "outro") {
      if (!otherDate) nextErrors.date = "Escolha uma data.";
      else if (otherDate > today)
        nextErrors.date =
          "Lançamento não tem data futura. Para algo que vai acontecer, use um fixo.";
    }
    setErrors(nextErrors);
    if (!read.ok || Object.keys(nextErrors).length > 0) {
      if (nextErrors.amountCents) amountRef.current?.focus();
      else if (nextErrors.date) document.getElementById(`${idBase}-data`)?.focus();
      else document.getElementById(`${idBase}-meses`)?.focus();
      return;
    }
    const cents = read.cents;
    const payload = {
      kind,
      amountCents: cents,
      categoryId,
      description: description.trim() || null,
      date,
    };
    setBusy(true);
    const result =
      mode === "new"
        ? await runAction(() =>
            createEntryAction({
              ...payload,
              id: newId,
              repeatMonthly: repeat,
              repeatCount: limited ? count : null,
            }),
          )
        : await runAction(() => updateEntryAction(initial.id, payload));
    if (!result.ok) {
      setBusy(false);
      if (result.code === "session_expired") {
        router.push(signInHref() as Route);
        return;
      }
      if (result.fields) {
        setErrors(result.fields);
        if (result.fields.amountCents) amountRef.current?.focus();
      }
      setFormError(result.fields ? null : result.message);
      return;
    }
    if (mode === "new") {
      await ripple.play(saveRef.current);
      announce(result.data.message, { coin: true });
      highlight(result.data.id);
    } else {
      announce(result.data.message);
      highlight(result.data.id);
    }
    router.replace(homeFor(monthOf(date), today));
  }

  async function remove() {
    if (!initial.id) return;
    setDeleting(true);
    const result = await runAction(() => deleteEntryAction(initial.id));
    setDeleting(false);
    if (!result.ok) {
      setFormError(result.message);
      return;
    }
    announce(result.data.message);
    router.replace(homeFor(monthOf(initial.date ?? today), today));
  }

  return (
    <>
      <TaskHeader title={title} backHref={backHref} dirty={dirty} />
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

        {initial.recurringId ? (
          <Notice tone="info">Veio de um fixo. Mudar aqui vale só para este mês.</Notice>
        ) : null}

        <SegmentedToggle
          value={kind}
          onValueChange={(k) => {
            setKind(k);
            setCategoryId(null);
            touch();
          }}
          disabled={busy}
        />

        <MoneyInput
          id={`${idBase}-valor`}
          label={kind === "income" ? "Quanto entrou?" : "Quanto foi?"}
          kind={kind}
          text={amountText}
          inputRef={amountRef}
          focusOnMount={mode === "new"}
          error={errors.amountCents}
          onTextChange={(text) => {
            setAmountText(text);
            touch();
            if (errors.amountCents) {
              const read = readMoney(text);
              setErrors((e) => ({ ...e, amountCents: read.ok ? "" : MONEY_ERRORS[read.error] }));
            }
          }}
          onBlur={() => {
            const read = readMoney(amountText);
            if (read.ok) setAmountText(formatAmount(read.cents));
          }}
          onEnter={() => categoryRef.current?.querySelector<HTMLInputElement>("input")?.focus()}
        />

        {mode === "new" ? (
          <Shortcuts
            items={shortcuts}
            onPick={(s) => {
              setCategoryId(s.categoryId);
              setDescription(s.label);
              touch();
              const category = list.find((c) => c.id === s.categoryId);
              announce(`Categoria ${category?.name ?? ""} e descrição ${s.label} preenchidas.`);
              if (!readMoney(amountText).ok) amountRef.current?.focus();
              else saveRef.current?.focus();
            }}
          />
        ) : null}

        <div ref={categoryRef}>
          <CategoryChips
            key={kind}
            categories={list}
            value={categoryId}
            onValueChange={(id) => {
              setCategoryId(id);
              touch();
            }}
          />
          {errors.categoryId ? (
            <p className="mt-2 text-caption text-tinta">{errors.categoryId}</p>
          ) : null}
        </div>

        <TextField
          id={`${idBase}-descricao`}
          label={
            <>
              Descrição <span className="font-normal text-tinta-suave">(opcional)</span>
            </>
          }
          help="Por exemplo: Mercado do bairro."
          maxLength={DESCRIPTION_MAX_LENGTH}
          value={description}
          error={errors.description}
          onChange={(event) => {
            setDescription(event.target.value);
            touch();
          }}
        />

        <div className="flex flex-col gap-3">
          <ChoiceChips<WhenChoice>
            legend="Quando?"
            name="quando"
            value={when}
            onValueChange={(v) => {
              setWhen(v);
              touch();
            }}
            options={[
              { value: "hoje", label: "Hoje" },
              { value: "ontem", label: "Ontem" },
              { value: "outro", label: "Outro dia" },
            ]}
          />
          {when === "outro" ? (
            <TextField
              id={`${idBase}-data`}
              label="Qual dia?"
              type="date"
              max={today}
              min={addDays(today, -3653)}
              value={otherDate}
              error={errors.date}
              onChange={(event) => {
                setOtherDate(event.target.value);
                touch();
              }}
            />
          ) : errors.date ? (
            <p className="text-caption text-tinta">{errors.date}</p>
          ) : null}
        </div>

        {mode === "new" ? (
          <CheckboxField
            label="Repete todo mês"
            help="Cria um fixo: o Midas anota sozinho, no mesmo dia, nos próximos meses."
            checked={repeat}
            error={errors.repeatMonthly}
            onChange={(value) => {
              setRepeat(value);
              touch();
            }}
          />
        ) : null}
        {mode === "new" && repeat ? (
          <div className="flex flex-col gap-3">
            <ChoiceChips<"forever" | "months">
              legend="Até quando?"
              name="ate-quando"
              value={repeatUntil}
              onValueChange={(v) => {
                setRepeatUntil(v);
                touch();
              }}
              options={[
                { value: "forever", label: "Sem fim" },
                { value: "months", label: "Por alguns meses" },
              ]}
            />
            {repeatUntil === "months" ? (
              <TextField
                id={`${idBase}-meses`}
                label="Quantos meses, contando este?"
                help="Por exemplo, 10 para uma compra em 10 parcelas."
                inputMode="numeric"
                value={repeatCount}
                error={errors.repeatCount}
                onChange={(event) => {
                  setRepeatCount(event.target.value.replace(/\D/g, "").slice(0, 3));
                  touch();
                }}
              />
            ) : null}
          </div>
        ) : null}

        <Button
          ref={saveRef}
          type="submit"
          size="lg"
          fullWidth
          busy={busy}
          busyLabel="Salvando…"
          className={mode === "new" ? "md-toque" : undefined}
          onPointerDown={ripple.onPointerDown}
          icon={ripple.element}
        >
          {mode === "edit"
            ? "Salvar alterações"
            : kind === "income"
              ? "Salvar renda"
              : "Salvar gasto"}
        </Button>

        {mode === "edit" && initial.id ? (
          <div className="border-t border-veio pt-6">
            <ConfirmInline
              trigger="Excluir lançamento"
              question={`Excluir “${initial.description || list.find((c) => c.id === initial.categoryId)?.name || "Outros"}”, ${formatSigned(initial.amountCents ?? 0, initial.kind)}? Não dá para desfazer.`}
              confirmLabel="Excluir lançamento"
              keepLabel="Manter lançamento"
              busy={deleting}
              onConfirm={() => void remove()}
            />
          </div>
        ) : null}
      </form>
    </>
  );
}
