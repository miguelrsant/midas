/* eslint-disable @next/next/no-img-element -- ornamento SVG servido do próprio app. */
import type { Route } from "next";
import Link from "next/link";

import { buttonClasses } from "@/components/ui/button";
import { type MonthKey } from "@/lib/dates";
import { monthLabel } from "@/lib/finance/phrases";

import { Money } from "./money";

/** Conquista do mês fechado no azul (docs/design-system/componentes/achievement.md). */
export function Achievement({
  month,
  savedCents,
  sentence,
}: {
  month: MonthKey;
  savedCents: number;
  sentence: string;
}) {
  return (
    <section
      aria-labelledby="conquista-titulo"
      className="md-marmore flex flex-col items-center gap-2 rounded-lg p-6 text-center shadow-cartao"
    >
      <div className="relative flex w-full max-w-60 items-center justify-center">
        <img
          src="/ornamentos/louros.svg"
          alt=""
          aria-hidden="true"
          className="w-full dark:hidden"
        />
        <img
          src="/ornamentos/louros-noite.svg"
          alt=""
          aria-hidden="true"
          className="hidden w-full dark:block"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="md-eyebrow">{monthLabel(month)}</span>
          <Money
            cents={savedCents}
            whole
            className="font-classica text-[2.25rem]/[2.5rem] font-bold text-tinta"
          />
          <span className="text-caption text-tinta-suave">guardados</span>
        </div>
      </div>
      <h2 id="conquista-titulo" className="font-display text-heading text-tinta">
        Mês fechado <em className="md-acento">no azul</em>.
      </h2>
      <p className="max-w-[32ch] text-caption text-tinta-suave">{sentence}</p>
      <Link href={`/resumo/${month}` as Route} className={buttonClasses({ variant: "ghost" })}>
        Ver resumo do mês
      </Link>
    </section>
  );
}

/** Mostra a conquista? Mês fechado com R$ 1,00 ou mais de sobra, dias 1 a 7, resumo ainda não aberto. */
export function shouldShowAchievement(o: {
  closedMonthBalanceCents: number;
  todayDay: number;
  summaryOpened: boolean;
}) {
  return o.closedMonthBalanceCents >= 100 && o.todayDay <= 7 && !o.summaryOpened;
}
