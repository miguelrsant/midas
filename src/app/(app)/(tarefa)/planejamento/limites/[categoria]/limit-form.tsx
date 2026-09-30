"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";

import { removeLimitAction, setLimitAction } from "@/app/(app)/_actions/planning";
import { CategoryChips } from "@/components/midas/choices";
import { ConfirmInline } from "@/components/midas/confirm-inline";
import { useAnnounce } from "@/components/midas/golden-touch";
import { MoneyInput } from "@/components/midas/money-input";
import { TaskHeader } from "@/components/midas/task-header";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { runAction, signInHref } from "@/lib/actions/client";
import type { Category } from "@/lib/categories";
import { formatAmount, MONEY_ERRORS, readMoney } from "@/lib/money";

/** Definir, mudar ou remover o limite de uma categoria de gasto. */
export function LimitForm({
  categories,
  initialCategoryId,
  initialAmount,
}: {
  categories: Category[];
  initialCategoryId: string | null;
  initialAmount: number | null;
}) {
  const router = useRouter();
  const { announce } = useAnnounce();
  const id = useId();
  const [categoryId, setCategoryId] = useState<string | null>(initialCategoryId);
  const [text, setText] = useState(initialAmount ? formatAmount(initialAmount) : "");
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const back = "/planejamento/limites" as Route;
  const category = categories.find((c) => c.id === categoryId);

  async function save() {
    setFormError(null);
    if (!categoryId) return setFormError("Escolha uma categoria.");
    const read = readMoney(text);
    if (!read.ok) {
      setError(MONEY_ERRORS[read.error]);
      inputRef.current?.focus();
      return;
    }
    setBusy(true);
    const result = await runAction(() => setLimitAction({ categoryId, amountCents: read.cents }));
    setBusy(false);
    if (!result.ok) {
      if (result.code === "session_expired") return router.push(signInHref() as Route);
      return setFormError(result.fields?.categoryId ?? result.message);
    }
    announce(result.data.message);
    router.push(back);
  }

  async function remove() {
    if (!categoryId) return;
    setRemoving(true);
    const result = await runAction(() => removeLimitAction(categoryId));
    setRemoving(false);
    if (!result.ok) return setFormError(result.message);
    announce(result.data.message);
    router.push(back);
  }

  return (
    <>
      <TaskHeader title={initialAmount ? "Mudar limite" : "Definir um limite"} backHref={back} />
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
        {initialCategoryId ? null : (
          <CategoryChips
            legend="Qual categoria?"
            categories={categories}
            value={categoryId}
            onValueChange={setCategoryId}
          />
        )}
        <MoneyInput
          id={`${id}-valor`}
          label={
            category ? `Quanto você quer gastar com ${category.name} por mês?` : "Quanto por mês?"
          }
          text={text}
          inputRef={inputRef}
          focusOnMount={Boolean(initialCategoryId)}
          error={error}
          help="O Midas avisa quando o gasto chegar a 90%."
          onTextChange={(t) => {
            setText(t);
            if (error) setError(null);
          }}
        />
        <Button type="submit" size="lg" fullWidth busy={busy} busyLabel="Salvando…">
          Salvar limite
        </Button>
        {initialAmount && category ? (
          <div className="border-t border-veio pt-6">
            <ConfirmInline
              trigger="Remover limite"
              question={`Remover o limite de ${category.name}?`}
              confirmLabel="Remover limite"
              keepLabel="Manter limite"
              busy={removing}
              busyLabel="Removendo…"
              onConfirm={() => void remove()}
            />
          </div>
        ) : null}
      </form>
    </>
  );
}
