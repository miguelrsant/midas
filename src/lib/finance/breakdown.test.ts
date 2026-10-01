import { describe, expect, it } from "vitest";

import { donutArcs, topSlices, totalsByCategory } from "./breakdown";

const totals = (pairs: Array<[string, number]>) => new Map(pairs);

describe("gastos por categoria", () => {
  it("soma só o tipo e o mês pedidos", () => {
    const map = totalsByCategory(
      [
        { kind: "expense", categoryId: "mercado", amountCents: 100, date: "2026-09-01" },
        { kind: "expense", categoryId: "mercado", amountCents: 50, date: "2026-09-30" },
        { kind: "expense", categoryId: "mercado", amountCents: 999, date: "2026-08-31" },
        { kind: "income", categoryId: "salario", amountCents: 999, date: "2026-09-05" },
      ],
      "expense",
      "2026-09",
    );
    expect([...map]).toEqual([["mercado", 150]]);
  });

  it("até 6 categorias, mostra todas, da maior para a menor", () => {
    const slices = topSlices(
      totals([
        ["a", 10],
        ["b", 60],
        ["c", 30],
        ["d", 5],
        ["e", 3],
        ["f", 2],
      ]),
    );
    expect(slices.map((s) => s.key)).toEqual(["b", "c", "a", "d", "e", "f"]);
    expect(slices.some((s) => s.other)).toBe(false);
  });

  it("com 7, as 5 maiores e Outros", () => {
    const slices = topSlices(
      totals([
        ["a", 70],
        ["b", 60],
        ["c", 50],
        ["d", 40],
        ["e", 30],
        ["f", 20],
        ["g", 10],
      ]),
    );
    expect(slices.map((s) => s.key)).toEqual(["a", "b", "c", "d", "e", "outros"]);
    expect(slices.at(-1)).toMatchObject({ categoryIds: ["f", "g"], cents: 30, other: true });
  });

  it("a categoria Outros entra na fatia Outros, sempre por último", () => {
    const slices = topSlices(
      totals([
        ["outros-gasto", 900],
        ["mercado", 100],
      ]),
    );
    expect(slices.map((s) => s.key)).toEqual(["mercado", "outros"]);
    expect(slices[1]).toMatchObject({ categoryIds: ["outros-gasto"], cents: 900, other: true });
  });

  it("6 com Outros contam como 6; 6 nomeadas e Outros juntam a menor", () => {
    const five = topSlices(
      totals([
        ["a", 5],
        ["b", 4],
        ["c", 3],
        ["d", 2],
        ["e", 1],
        ["outros-gasto", 1],
      ]),
    );
    expect(five.map((s) => s.key)).toEqual(["a", "b", "c", "d", "e", "outros"]);
    const six = topSlices(
      totals([
        ["a", 6],
        ["b", 5],
        ["c", 4],
        ["d", 3],
        ["e", 2],
        ["f", 1],
        ["outros-gasto", 1],
      ]),
    );
    expect(six.at(-1)).toMatchObject({ categoryIds: ["f", "outros-gasto"], cents: 2 });
  });

  it("empate não pula de ordem e nada vira lista vazia por engano", () => {
    expect(
      topSlices(
        totals([
          ["b", 10],
          ["a", 10],
        ]),
      ).map((s) => s.key),
    ).toEqual(["a", "b"]);
    expect(topSlices(new Map())).toEqual([]);
    expect(topSlices(totals([["a", 0]]))).toEqual([]);
  });

  it("porcentagens para baixo: somam no máximo 100 e só uma fatia mostra 100%", () => {
    const slices = topSlices(
      totals([
        ["a", 1],
        ["b", 1],
        ["c", 1],
      ]),
    );
    expect(slices.map((s) => s.percent)).toEqual([33, 33, 33]);
    expect(
      topSlices(
        totals([
          ["a", 999],
          ["b", 1],
        ]),
      )[0]!.percent,
    ).toBe(99);
    expect(topSlices(totals([["a", 5]]))[0]!.percent).toBe(100);
  });
});

describe("arcos da rosca", () => {
  const length = (dash: string) => Number(dash.split(" ")[0]);

  it("fatias mais espaços fecham o círculo", () => {
    const arcs = donutArcs([{ cents: 50 }, { cents: 30 }, { cents: 20 }]);
    const total = arcs.reduce((s, a) => s + length(a.dash), 0) + arcs.length * 1;
    expect(total).toBeCloseTo(100, 6);
    expect(arcs.map((a) => a.offset)).toEqual([25, -25, -55]);
  });

  it("uma fatia só é o círculo inteiro, sem espaço", () => {
    expect(donutArcs([{ cents: 7 }])).toEqual([{ dash: "100 0", offset: 25 }]);
  });

  it("fatia menor que o espaço não fica negativa", () => {
    const arcs = donutArcs([{ cents: 9_999 }, { cents: 1 }]);
    expect(length(arcs[1]!.dash)).toBe(0);
  });

  it("sem valor, sem arcos", () => {
    expect(donutArcs([])).toEqual([]);
  });
});
