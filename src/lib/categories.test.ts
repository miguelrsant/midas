import { describe, expect, it } from "vitest";

import {
  capitalizeName,
  findCategory,
  formCategories,
  nameKey,
  resolveCategories,
  sortByValueOtherLast,
} from "./categories";
import { categoryIcon, ICON_GROUPS, PICKABLE_ICON_KEYS } from "./category-icons";

describe("categorias", () => {
  it("aplica nome, ícone e escondida da pessoa às prontas", () => {
    const list = resolveCategories([
      {
        id: "x",
        kind: "expense",
        systemId: "mercado",
        name: "Supermercado",
        icon: "feira",
        hidden: false,
      },
      { id: "y", kind: "expense", systemId: "lazer", name: null, icon: null, hidden: true },
    ]);
    const mercado = list.find((c) => c.id === "mercado")!;
    expect(mercado).toMatchObject({ name: "Supermercado", icon: "feira", system: true });
    expect(list.find((c) => c.id === "lazer")!.hidden).toBe(true);
  });

  it("'Outros' nunca fica escondida", () => {
    const list = resolveCategories([
      { id: "x", kind: "expense", systemId: "outros-gasto", name: null, icon: null, hidden: true },
    ]);
    expect(list.find((c) => c.id === "outros-gasto")!.hidden).toBe(false);
  });

  it("formulário: ordem por uso, Outros por último, sem escondidas e sem calculadora", () => {
    const list = resolveCategories([
      {
        id: "u-1",
        kind: "expense",
        systemId: null,
        name: "Academia",
        icon: "academia",
        hidden: false,
      },
      { id: "z", kind: "expense", systemId: "lazer", name: null, icon: null, hidden: true },
    ]);
    const usage = new Map([
      ["saude", 5],
      ["outros-gasto", 99],
      ["u-1", 3],
    ]);
    const ids = formCategories(list, "expense", usage).map((c) => c.id);
    expect(ids.slice(0, 3)).toEqual(["saude", "u-1", "mercado"]);
    expect(ids.at(-1)).toBe("outros-gasto");
    expect(ids).not.toContain("lazer");
    expect(formCategories(list, "income", new Map()).map((c) => c.id)).not.toContain(
      "decimo-terceiro",
    );
  });

  it("mantém a escondida quando é a do lançamento em edição", () => {
    const list = resolveCategories([
      { id: "z", kind: "expense", systemId: "lazer", name: null, icon: null, hidden: true },
    ]);
    expect(formCategories(list, "expense", new Map(), "lazer").map((c) => c.id)).toContain("lazer");
  });

  it("categoria desconhecida vira Outros", () => {
    const list = resolveCategories([]);
    expect(findCategory(list, "u-apagada").id).toBe("outros-gasto");
  });

  it("Outros por último nos gráficos", () => {
    const sorted = sortByValueOtherLast([
      { categoryId: "outros-gasto", cents: 900 },
      { categoryId: "mercado", cents: 100 },
      { categoryId: "saude", cents: 500 },
    ]);
    expect(sorted.map((s) => s.categoryId)).toEqual(["saude", "mercado", "outros-gasto"]);
  });

  it("nomes: maiúscula automática e comparação sem acento", () => {
    expect(capitalizeName("  academia  do bairro ")).toBe("Academia do bairro");
    expect(nameKey("Saúde")).toBe(nameKey("saude"));
  });

  it("todos os ícones existem e as chaves não se repetem", () => {
    const keys = ICON_GROUPS.flatMap((g) => g.icons.map((i) => i.key));
    expect(new Set(keys).size).toBe(keys.length);
    expect(PICKABLE_ICON_KEYS.has("remedio")).toBe(true);
    for (const key of [...keys, "calc-ferias", "calc-seguro"])
      expect(categoryIcon(key)).toBeTruthy();
  });
});
