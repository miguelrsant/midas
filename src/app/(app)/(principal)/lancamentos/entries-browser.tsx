"use client";

import { Search } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useId, useMemo, useState } from "react";

import { CategoryIcon } from "@/components/midas/category-icon";
import { Money } from "@/components/midas/money";
import { ChoiceChips } from "@/components/midas/choices";
import { DayGroups, type RowEntry } from "@/components/midas/transaction-list";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { type Category, findCategory } from "@/lib/categories";
import { type DateOnly, formatDayMonthShort } from "@/lib/dates";
import type { Upcoming } from "@/lib/finance/upcoming";

type Filter = "todos" | "gastos" | "rendas";

const normalize = (text: string) =>
  text.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("pt-BR");

/**
 * Filtros e busca na própria tela, sobre o mês já carregado: o termo buscado nunca vai
 * para a URL nem para o servidor (pode revelar saúde, como "farmácia").
 */
export function EntriesBrowser({
  entries,
  upcoming,
  categories,
  today,
  monthName,
  isCurrent,
}: {
  entries: RowEntry[];
  /** Mês atual: fixos e rendas previstas que ainda vão chegar. */
  upcoming: Upcoming[];
  categories: Category[];
  today: DateOnly;
  monthName: string;
  isCurrent: boolean;
}) {
  const [filter, setFilter] = useState<Filter>("todos");
  const [query, setQuery] = useState("");
  const searchId = useId();

  const matches = useMemo(() => {
    const q = normalize(query.trim());
    return (e: { kind: string; categoryId: string; text: string | null }) => {
      if (filter === "gastos" && e.kind !== "expense") return false;
      if (filter === "rendas" && e.kind !== "income") return false;
      if (!q) return true;
      return normalize(`${e.text ?? ""} ${findCategory(categories, e.categoryId).name}`).includes(
        q,
      );
    };
  }, [filter, query, categories]);
  const visible = entries.filter((e) => matches({ ...e, text: e.description }));
  const visibleUpcoming = upcoming.filter((u) => matches({ ...u, text: u.title }));

  if (entries.length === 0 && upcoming.length === 0) {
    return (
      <EmptyState
        title={
          isCurrent ? (
            <>
              {monthName.charAt(0).toUpperCase() + monthName.slice(1)} começa{" "}
              <em className="md-acento">aqui</em>.
            </>
          ) : (
            `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ficou em branco.`
          )
        }
      >
        {isCurrent
          ? "Anote o primeiro gasto do mês e o Midas passa a mostrar para onde vai o seu dinheiro."
          : `Se lembrar de algum gasto ou renda de ${monthName}, anote aqui e o gráfico do ano fica completo.`}
      </EmptyState>
    );
  }

  const shownQuery = query.trim().slice(0, 40);
  return (
    <div className="flex flex-col gap-4">
      <ChoiceChips<Filter>
        legend="Mostrar"
        legendHidden
        name="filtro"
        value={filter}
        onValueChange={setFilter}
        options={[
          { value: "todos", label: "Todos" },
          { value: "gastos", label: "Gastos" },
          { value: "rendas", label: "Rendas" },
        ]}
      />
      <div className="flex flex-col gap-1">
        <label htmlFor={searchId} className="md-sr">
          Buscar lançamento
        </label>
        <span className="flex min-h-13 items-center gap-2 rounded-md border border-borda bg-superficie-funda px-4 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-foco">
          <Search aria-hidden="true" className="size-5 text-tinta-suave" strokeWidth={1.75} />
          <input
            id={searchId}
            type="search"
            placeholder="Buscar lançamento"
            autoComplete="off"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="min-w-0 flex-1 border-0 bg-transparent py-3 text-body text-tinta outline-none placeholder:text-tinta-suave"
          />
        </span>
      </div>
      <div role="status">
        {visible.length === 0 && visibleUpcoming.length === 0 ? (
          <div className="flex flex-col items-start gap-3 py-4">
            <p className="text-body text-tinta">
              {shownQuery
                ? `Nenhum lançamento com “${shownQuery}” em ${monthName}.`
                : filter === "rendas"
                  ? `Nenhuma renda em ${monthName}.`
                  : `Nenhum gasto em ${monthName}.`}
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                setQuery("");
                setFilter("todos");
              }}
            >
              {shownQuery ? "Limpar busca" : "Limpar filtros"}
            </Button>
          </div>
        ) : null}
      </div>
      {visible.length > 0 ? (
        <DayGroups entries={visible} categories={categories} today={today} />
      ) : entries.length === 0 ? (
        <p className="px-2 text-body text-tinta-suave">Nada anotado ainda em {monthName}.</p>
      ) : null}
      {visibleUpcoming.length > 0 ? (
        <UpcomingList
          items={visibleUpcoming}
          categories={categories}
          today={today}
          monthName={monthName}
        />
      ) : null}
    </div>
  );
}

/** "Ainda vai chegar": fixos que não chegaram ao dia e rendas previstas, com a data. */
function UpcomingList({
  items,
  categories,
  today,
  monthName,
}: {
  items: Upcoming[];
  categories: Category[];
  today: DateOnly;
  monthName: string;
}) {
  return (
    <section aria-labelledby="ainda-vai-chegar">
      <h2 id="ainda-vai-chegar" className="px-2 pb-1 text-label text-tinta-suave">
        Ainda vai chegar em {monthName}
      </h2>
      <ul className="flex flex-col rounded-lg border border-dashed border-borda bg-superficie/60">
        {items.map((u) => {
          const category = findCategory(categories, u.categoryId);
          const when =
            u.source === "fixo"
              ? `dia ${Number(u.date.slice(8))}`
              : `${u.late ? "era até" : "até"} ${formatDayMonthShort(u.date)}`;
          const href = (
            u.source === "fixo" ? `/planejamento/fixos/${u.id}` : "/planejamento"
          ) as Route;
          return (
            <li key={u.key} className="border-b border-veio last:border-b-0">
              <Link
                href={href}
                className="grid min-h-16 grid-cols-[44px_1fr_auto] items-center gap-3 px-2 py-2 hover:bg-superficie-funda focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foco"
              >
                <CategoryIcon icon={category.icon} kind={u.kind} />
                <span className="min-w-0">
                  <span className="block truncate text-body font-semibold text-tinta">
                    {u.title || category.name}
                  </span>
                  <span className="block text-caption text-tinta-suave">
                    <span className="mr-2 rounded-pill bg-superficie-funda px-2 py-0.5 font-semibold">
                      {u.source === "fixo" ? "fixo" : "prevista"}
                    </span>
                    {when}
                    {u.date === today ? " (hoje)" : ""}
                  </span>
                </span>
                <span
                  className={`font-mono text-amount whitespace-nowrap ${u.kind === "income" ? "text-renda" : "text-gasto"}`}
                >
                  <span className="md-sr">{u.kind === "income" ? "Vai entrar " : "Vai sair "}</span>
                  <span aria-hidden="true">{u.kind === "income" ? "+ " : "− "}</span>
                  <Money cents={u.amountCents} />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
