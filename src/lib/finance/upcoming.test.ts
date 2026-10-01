import { describe, expect, it } from "vitest";

import { upcomingThisMonth } from "./upcoming";

const fixo = (id: string, next: string | null, kind: "income" | "expense" = "expense") => ({
  id,
  kind,
  amountCents: 100,
  categoryId: "contas",
  description: null,
  nextOccurrenceOn: next,
});
const prevista = (id: string, dueDate: string) => ({
  id,
  amountCents: 500,
  categoryId: "ferias",
  label: "Férias",
  dueDate,
});

describe("o que ainda vai chegar no mês", () => {
  const today = "2026-10-01";

  it("fixos com a próxima vez neste mês, em ordem de data", () => {
    const items = upcomingThisMonth(
      [
        fixo("b", "2026-10-20"),
        fixo("a", "2026-10-05", "income"),
        fixo("c", "2026-11-05"),
        fixo("d", null),
      ],
      [],
      today,
    );
    expect(items.map((i) => [i.id, i.date, i.kind])).toEqual([
      ["a", "2026-10-05", "income"],
      ["b", "2026-10-20", "expense"],
    ]);
  });

  it("rendas previstas deste mês e as atrasadas; as de meses seguintes ficam de fora", () => {
    const items = upcomingThisMonth(
      [],
      [prevista("x", "2026-09-20"), prevista("y", "2026-10-18"), prevista("z", "2026-11-30")],
      today,
    );
    expect(items.map((i) => [i.id, i.late, i.source])).toEqual([
      ["x", true, "prevista"],
      ["y", false, "prevista"],
    ]);
  });
});
