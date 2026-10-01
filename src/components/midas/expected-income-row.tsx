"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";

import { dismissExpectedAction, receiveExpectedAction } from "@/app/(app)/_actions/planning";
import { Button } from "@/components/ui/button";
import { runAction, signInHref } from "@/lib/actions/client";
import { addDays, type DateOnly, formatDayMonthShort } from "@/lib/dates";
import { formatAmount, MONEY_ERRORS, readMoney } from "@/lib/money";
import { HOME } from "@/lib/navigation";

import { CategoryIcon } from "./category-icon";
import { ChoiceChips } from "./choices";
import { useAnnounce } from "./golden-touch";
import { Money } from "./money";
import { MoneyInput } from "./money-input";

/** Renda prevista das calculadoras (docs/design-system/componentes/expected-income-row.md). */
export function ExpectedIncomeRow({
  item,
  label,
  icon,
  today,
}: {
  item: { id: string; amountCents: number; dueDate: DateOnly };
  label: string;
  icon: string;
  today: DateOnly;
}) {
  const router = useRouter();
  const { announce } = useAnnounce();
  const id = useId();
  const [mode, setMode] = useState<"idle" | "receive" | "dismiss">("idle");
  const [text, setText] = useState(formatAmount(item.amountCents));
  const [when, setWhen] = useState<"hoje" | "ontem">("hoje");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [entryId] = useState(() => crypto.randomUUID());
  const inputRef = useRef<HTMLInputElement>(null);
  const late = item.dueDate < today;

  async function receive() {
    const read = readMoney(text);
    if (!read.ok) {
      setError(MONEY_ERRORS[read.error]);
      inputRef.current?.focus();
      return;
    }
    setBusy(true);
    const result = await runAction(() =>
      receiveExpectedAction({
        expectedId: item.id,
        entryId,
        amountCents: read.cents,
        date: when === "hoje" ? today : addDays(today, -1),
      }),
    );
    setBusy(false);
    if (!result.ok) {
      if (result.code === "session_expired") return router.push(signInHref() as Route);
      setError(result.fields?.amountCents ?? result.message);
      return;
    }
    announce(result.data.message);
    router.push(HOME);
  }

  async function dismiss() {
    setBusy(true);
    const result = await runAction(() => dismissExpectedAction(item.id));
    setBusy(false);
    if (!result.ok) return setError(result.message);
    announce(result.data.message);
  }

  return (
    <li className="flex flex-col gap-3 border-b border-veio py-3 last:border-b-0">
      <div className="grid grid-cols-[44px_1fr_auto] items-center gap-3 px-2">
        <CategoryIcon icon={icon} kind="income" />
        <span className="min-w-0">
          <span className="block truncate text-body font-semibold text-tinta">{label}</span>
          <span className="block text-caption text-tinta-suave">
            <span className="mr-2 rounded-pill bg-superficie-funda px-2 py-0.5 font-semibold">
              prevista
            </span>
            {late ? "era até" : "até"} {formatDayMonthShort(item.dueDate)}
          </span>
        </span>
        <span className="font-mono text-amount">
          <span className="md-sr">Vai entrar </span>
          <Money cents={item.amountCents} kind="income" />
        </span>
      </div>
      {late && mode === "idle" ? (
        <p className="px-2 text-caption text-tinta-suave">Chegou? Toque em Recebi.</p>
      ) : null}
      {mode === "idle" ? (
        <div className="flex gap-2 px-2">
          <Button
            variant="secondary"
            size="sm"
            aria-label={`Recebi: ${label}`}
            onClick={() => setMode("receive")}
          >
            Recebi
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Não recebi: ${label}`}
            onClick={() => setMode("dismiss")}
          >
            Não recebi
          </Button>
        </div>
      ) : null}
      {mode === "receive" ? (
        <form
          noValidate
          className="flex flex-col gap-4 rounded-md border border-veio bg-superficie p-4"
          onSubmit={(event) => {
            event.preventDefault();
            void receive();
          }}
        >
          <MoneyInput
            id={`${id}-valor`}
            label="Quanto entrou?"
            kind="income"
            text={text}
            inputRef={inputRef}
            focusOnMount
            error={error}
            onTextChange={setText}
          />
          <ChoiceChips<"hoje" | "ontem">
            legend="Quando?"
            name={`${id}-quando`}
            value={when}
            onValueChange={setWhen}
            options={[
              { value: "hoje", label: "Hoje" },
              { value: "ontem", label: "Ontem" },
            ]}
          />
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" busy={busy} busyLabel="Anotando…">
              Anotar renda
            </Button>
            <Button variant="secondary" onClick={() => setMode("idle")}>
              Cancelar
            </Button>
          </div>
        </form>
      ) : null}
      {mode === "dismiss" ? (
        <div
          role="group"
          aria-labelledby={`${id}-tirar`}
          className="flex flex-col gap-3 rounded-md border border-veio p-4"
        >
          <p id={`${id}-tirar`} className="text-body text-tinta">
            Tirar “{label}” do planejamento?
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="danger"
              busy={busy}
              busyLabel="Tirando…"
              onClick={() => void dismiss()}
            >
              Tirar do planejamento
            </Button>
            <Button variant="secondary" onClick={() => setMode("idle")}>
              Manter
            </Button>
          </div>
          {error ? <p className="text-caption text-tinta">{error}</p> : null}
        </div>
      ) : null}
    </li>
  );
}
