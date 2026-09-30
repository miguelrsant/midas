import type { EntryKind } from "./entry";

/**
 * Modelos prontos (docs/design-system/componentes/shortcuts.md e 17-padroes-de-tela.md):
 * atalhos do lançamento (preenchem categoria e descrição) e fixos prontos (preenchem
 * categoria, nome e um dia sugerido). O valor fica sempre com a pessoa.
 */

export interface Shortcut {
  id: string;
  kind: EntryKind;
  label: string;
  categoryId: string;
}

export const SHORTCUTS: readonly Shortcut[] = [
  { id: "cafe", kind: "expense", label: "Café", categoryId: "restaurante" },
  { id: "almoco", kind: "expense", label: "Almoço", categoryId: "restaurante" },
  { id: "lanche", kind: "expense", label: "Lanche", categoryId: "restaurante" },
  { id: "padaria", kind: "expense", label: "Padaria", categoryId: "mercado" },
  { id: "mercado", kind: "expense", label: "Mercado", categoryId: "mercado" },
  { id: "onibus", kind: "expense", label: "Ônibus e metrô", categoryId: "transporte" },
  { id: "corrida", kind: "expense", label: "Aplicativo de corrida", categoryId: "transporte" },
  { id: "gasolina", kind: "expense", label: "Gasolina", categoryId: "transporte" },
  { id: "farmacia", kind: "expense", label: "Farmácia", categoryId: "saude" },
  { id: "presente", kind: "expense", label: "Presente", categoryId: "compras" },
  { id: "salario", kind: "income", label: "Salário", categoryId: "salario" },
  { id: "freela", kind: "income", label: "Freela", categoryId: "freelance" },
  { id: "venda", kind: "income", label: "Venda", categoryId: "vendas" },
  { id: "pix", kind: "income", label: "Pix recebido", categoryId: "outros-renda" },
  { id: "reembolso", kind: "income", label: "Reembolso", categoryId: "outros-renda" },
  { id: "rendimento", kind: "income", label: "Rendimento", categoryId: "investimentos" },
];

export interface RecurringPreset {
  id: string;
  kind: EntryKind;
  label: string;
  categoryId: string;
  day: number;
  /** "Parcela de compra" pede o número de meses. */
  installments?: boolean;
}

export const RECURRING_PRESETS: readonly RecurringPreset[] = [
  { id: "aluguel", kind: "expense", label: "Aluguel", categoryId: "moradia", day: 10 },
  { id: "condominio", kind: "expense", label: "Condomínio", categoryId: "moradia", day: 10 },
  { id: "luz", kind: "expense", label: "Luz", categoryId: "contas", day: 15 },
  { id: "agua", kind: "expense", label: "Água", categoryId: "contas", day: 15 },
  { id: "gas", kind: "expense", label: "Gás", categoryId: "contas", day: 15 },
  { id: "internet", kind: "expense", label: "Internet", categoryId: "contas", day: 10 },
  { id: "celular", kind: "expense", label: "Celular", categoryId: "contas", day: 10 },
  { id: "plano-de-saude", kind: "expense", label: "Plano de saúde", categoryId: "saude", day: 10 },
  { id: "escola", kind: "expense", label: "Escola ou faculdade", categoryId: "educacao", day: 5 },
  { id: "academia", kind: "expense", label: "Academia", categoryId: "saude", day: 5 },
  { id: "streaming", kind: "expense", label: "Streaming", categoryId: "contas", day: 5 },
  { id: "transporte", kind: "expense", label: "Transporte", categoryId: "transporte", day: 5 },
  {
    id: "parcela",
    kind: "expense",
    label: "Parcela de compra",
    categoryId: "compras",
    day: 10,
    installments: true,
  },
  { id: "salario", kind: "income", label: "Salário", categoryId: "salario", day: 5 },
  {
    id: "aluguel-recebido",
    kind: "income",
    label: "Aluguel recebido",
    categoryId: "outros-renda",
    day: 10,
  },
  { id: "aposentadoria", kind: "income", label: "Aposentadoria", categoryId: "salario", day: 5 },
];

export function findRecurringPreset(id: string | null | undefined) {
  return RECURRING_PRESETS.find((p) => p.id === id);
}
