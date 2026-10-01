import type { Route } from "next";

import { type DateOnly, type MonthKey, monthOf } from "@/lib/dates";

/**
 * Para onde vai quem termina uma tarefa: o Início, com o aviso "Anotado" por cima
 * (docs/design-system/17-padroes-de-tela.md#depois-de-salvar).
 */
export const HOME = "/" as Route;

/** O Início no mês do lançamento: um gasto de agosto abre o Início em agosto. */
export function homeFor(month: MonthKey, today: DateOnly): Route {
  return (month < monthOf(today) ? `/?mes=${month}` : HOME) as Route;
}
