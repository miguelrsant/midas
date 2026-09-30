"use client";

import { Search } from "lucide-react";
import { useId, useMemo, useState } from "react";

import { ChoiceChips } from "@/components/midas/choices";
import { DayGroups, type RowEntry } from "@/components/midas/transaction-list";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { type Category, findCategory } from "@/lib/categories";
import type { DateOnly } from "@/lib/dates";

type Filter = "todos" | "gastos" | "rendas";

const normalize = (text: string) =>
  text.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("pt-BR");

/**
 * Filtros e busca na própria tela, sobre o mês já carregado: o termo buscado nunca vai
 * para a URL nem para o servidor (pode revelar saúde, como "farmácia").
 */
export function EntriesBrowser({
  entries,
  categories,
  today,
  monthName,
  isCurrent,
}: {
  entries: RowEntry[];
  categories: Category[];
  today: DateOnly;
  monthName: string;
  isCurrent: boolean;
}) {
  const [filter, setFilter] = useState<Filter>("todos");
  const [query, setQuery] = useState("");
  const searchId = useId();

  const visible = useMemo(() => {
    const q = normalize(query.trim());
    return entries.filter((e) => {
      if (filter === "gastos" && e.kind !== "expense") return false;
      if (filter === "rendas" && e.kind !== "income") return false;
      if (!q) return true;
      const text = `${e.description ?? ""} ${findCategory(categories, e.categoryId).name}`;
      return normalize(text).includes(q);
    });
  }, [entries, filter, query, categories]);

  if (entries.length === 0) {
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
        {visible.length === 0 ? (
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
      ) : null}
    </div>
  );
}
