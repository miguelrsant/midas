import type { EntryKind } from "./entry";

/**
 * Categorias (docs/design-system/15-categorias.md).
 * As prontas ficam aqui, no código; o lançamento guarda só o id. Categorias próprias
 * ("u-<uuid>") e os ajustes das prontas (nome, ícone, escondida) vêm da tabela
 * `user_category` e entram por `resolveCategories`.
 */

export type IconKey = string;

export interface SystemCategory {
  id: string;
  kind: EntryKind;
  name: string;
  icon: IconKey;
  defaultOrder: number;
  fromCalculator?: boolean;
}

export interface Category {
  id: string;
  kind: EntryKind;
  name: string;
  icon: IconKey;
  defaultOrder: number;
  system: boolean;
  hidden: boolean;
  fromCalculator: boolean;
}

export const OTHER_EXPENSE = "outros-gasto";
export const OTHER_INCOME = "outros-renda";

export function otherCategory(kind: EntryKind) {
  return kind === "income" ? OTHER_INCOME : OTHER_EXPENSE;
}

export const SYSTEM_CATEGORIES: readonly SystemCategory[] = [
  { id: "mercado", kind: "expense", name: "Mercado", icon: "mercado", defaultOrder: 1 },
  { id: "restaurante", kind: "expense", name: "Restaurante", icon: "restaurante", defaultOrder: 2 },
  { id: "transporte", kind: "expense", name: "Transporte", icon: "transporte", defaultOrder: 3 },
  { id: "moradia", kind: "expense", name: "Moradia", icon: "moradia", defaultOrder: 4 },
  { id: "contas", kind: "expense", name: "Contas", icon: "contas", defaultOrder: 5 },
  { id: "saude", kind: "expense", name: "Saúde", icon: "saude", defaultOrder: 6 },
  { id: "educacao", kind: "expense", name: "Educação", icon: "educacao", defaultOrder: 7 },
  { id: "lazer", kind: "expense", name: "Lazer", icon: "lazer", defaultOrder: 8 },
  { id: "compras", kind: "expense", name: "Compras", icon: "compras", defaultOrder: 9 },
  { id: OTHER_EXPENSE, kind: "expense", name: "Outros", icon: "outros", defaultOrder: 10 },
  { id: "salario", kind: "income", name: "Salário", icon: "salario", defaultOrder: 1 },
  { id: "freelance", kind: "income", name: "Freelance", icon: "freelance", defaultOrder: 2 },
  { id: "vendas", kind: "income", name: "Vendas", icon: "vendas", defaultOrder: 3 },
  {
    id: "investimentos",
    kind: "income",
    name: "Investimentos",
    icon: "investimentos",
    defaultOrder: 4,
  },
  { id: OTHER_INCOME, kind: "income", name: "Outros", icon: "outros", defaultOrder: 5 },
  {
    id: "decimo-terceiro",
    kind: "income",
    name: "13º salário",
    icon: "calc-decimo-terceiro",
    defaultOrder: 90,
    fromCalculator: true,
  },
  {
    id: "ferias",
    kind: "income",
    name: "Férias",
    icon: "calc-ferias",
    defaultOrder: 91,
    fromCalculator: true,
  },
  {
    id: "rescisao",
    kind: "income",
    name: "Rescisão",
    icon: "calc-rescisao",
    defaultOrder: 92,
    fromCalculator: true,
  },
  {
    id: "seguro-desemprego",
    kind: "income",
    name: "Seguro-desemprego",
    icon: "calc-seguro",
    defaultOrder: 93,
    fromCalculator: true,
  },
];

const SYSTEM_BY_ID = new Map(SYSTEM_CATEGORIES.map((c) => [c.id, c]));

export function systemCategory(id: string): SystemCategory | undefined {
  return SYSTEM_BY_ID.get(id);
}

export const CALCULATOR_CATEGORY_IDS: ReadonlySet<string> = new Set(
  SYSTEM_CATEGORIES.filter((c) => c.fromCalculator).map((c) => c.id),
);

/** Id de categoria própria: "u-" + UUID. */
export const CUSTOM_CATEGORY_RE =
  /^u-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export const CUSTOM_CATEGORY_LIMIT = 30;
export const CATEGORY_NAME_MAX_LENGTH = 20;

/** O que vem do banco (já decifrado) para montar a lista da pessoa. */
export interface CategorySetting {
  /** "u-<uuid>" para próprias; o id da pronta para ajustes. */
  id: string;
  kind: EntryKind;
  systemId: string | null;
  name: string | null;
  icon: IconKey | null;
  hidden: boolean;
}

/** Junta as prontas com os ajustes e as próprias da pessoa. */
export function resolveCategories(settings: readonly CategorySetting[]): Category[] {
  const overrides = new Map(settings.filter((s) => s.systemId).map((s) => [s.systemId!, s]));
  const result: Category[] = SYSTEM_CATEGORIES.map((c) => {
    const o = c.fromCalculator ? undefined : overrides.get(c.id);
    const isOther = c.id === OTHER_EXPENSE || c.id === OTHER_INCOME;
    return {
      id: c.id,
      kind: c.kind,
      name: o?.name || c.name,
      icon: o?.icon || c.icon,
      defaultOrder: c.defaultOrder,
      system: true,
      hidden: isOther ? false : (o?.hidden ?? false),
      fromCalculator: Boolean(c.fromCalculator),
    };
  });
  let order = 50;
  for (const s of settings) {
    if (s.systemId) continue;
    result.push({
      id: s.id,
      kind: s.kind,
      name: s.name ?? "Categoria",
      icon: s.icon ?? "outros",
      defaultOrder: order++,
      system: false,
      hidden: s.hidden,
      fromCalculator: false,
    });
  }
  return result;
}

export function findCategory(categories: readonly Category[], id: string): Category {
  const found = categories.find((c) => c.id === id);
  if (found) return found;
  // Categoria apagada ou desconhecida: vira "Outros" (transaction-row.md, casos-limite).
  const kind: EntryKind = SYSTEM_BY_ID.get(id)?.kind ?? "expense";
  return categories.find((c) => c.id === otherCategory(kind))!;
}

/**
 * Categorias do formulário de lançamento novo, na ordem de uso: as mais usadas nos
 * últimos 90 dias primeiro (empate segue a ordem padrão), "Outros" sempre por último.
 * Escondidas e de calculadora ficam fora, salvo `keepId` (a categoria de um lançamento em edição).
 */
export function formCategories(
  categories: readonly Category[],
  kind: EntryKind,
  usage: ReadonlyMap<string, number>,
  keepId?: string | null,
): Category[] {
  const other = otherCategory(kind);
  return categories
    .filter((c) => c.kind === kind && ((!c.hidden && !c.fromCalculator) || c.id === keepId))
    .sort((a, b) => {
      if (a.id === other) return 1;
      if (b.id === other) return -1;
      const diff = (usage.get(b.id) ?? 0) - (usage.get(a.id) ?? 0);
      return diff !== 0 ? diff : a.defaultOrder - b.defaultOrder;
    });
}

/** "Outros" sempre por último em listas e gráficos, o resto pelo valor. */
export function sortByValueOtherLast<T extends { categoryId: string; cents: number }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    const ao = a.categoryId === OTHER_EXPENSE || a.categoryId === OTHER_INCOME;
    const bo = b.categoryId === OTHER_EXPENSE || b.categoryId === OTHER_INCOME;
    if (ao !== bo) return ao ? 1 : -1;
    return b.cents - a.cents;
  });
}

/** Normaliza para comparar nomes: sem maiúsculas nem acentos. */
export function nameKey(name: string) {
  return name.normalize("NFD").replace(/\p{M}/gu, "").trim().toLocaleLowerCase("pt-BR");
}

/** "academia do bairro" → "Academia do bairro". */
export function capitalizeName(name: string) {
  const t = name.trim().replace(/\s+/g, " ");
  return t.charAt(0).toLocaleUpperCase("pt-BR") + t.slice(1);
}
