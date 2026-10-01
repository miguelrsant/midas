import { describe, expect, it } from "vitest";

import { inferAdvancePercent, planSalary, splitSalary } from "./salary";

describe("salário dividido", () => {
  it("40% de R$ 1.000 é R$ 400 no adiantamento e R$ 600 no resto", () => {
    expect(splitSalary(100_000, 40)).toEqual({ advanceCents: 40_000, restCents: 60_000 });
  });

  it("os centavos que sobram ficam no resto, e as partes somam o total", () => {
    expect(splitSalary(33_333, 33)).toEqual({ advanceCents: 10_999, restCents: 22_334 });
    for (const net of [1, 99, 100, 12_345, 540_001, 999_999_999]) {
      for (const p of [1, 33, 40, 50, 99]) {
        const { advanceCents, restCents } = splitSalary(net, p);
        expect(advanceCents + restCents).toBe(net);
        expect(advanceCents).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("porcentagem fora de 1 a 99 é recusada", () => {
    expect(() => splitSalary(100, 0)).toThrow(RangeError);
    expect(() => splitSalary(100, 100)).toThrow(RangeError);
    expect(() => splitSalary(100, 40.5)).toThrow(RangeError);
  });

  it("valor grande não perde centavos", () => {
    expect(splitSalary(999_999_999, 99)).toEqual({
      advanceCents: 989_999_999,
      restCents: 10_000_000,
    });
  });

  it("descobre a porcentagem de volta", () => {
    for (const net of [100_000, 33_333, 540_000, 1_234_567]) {
      for (const p of [10, 33, 40, 90]) {
        const { advanceCents } = splitSalary(net, p);
        expect(splitSalary(net, inferAdvancePercent(advanceCents, net)).advanceCents).toBe(
          advanceCents,
        );
      }
    }
    expect(inferAdvancePercent(40_000, 100_000)).toBe(40);
  });

  it("1 centavo não dá para dividir", () => {
    expect(
      planSalary(1, 5, { mode: "split", advancePercent: 40, advanceDay: 20 }, "2026-09-20"),
    ).toEqual({
      ok: false,
      error: "too_small",
    });
  });

  it("cada parte começa na sua próxima data", () => {
    const split = { mode: "split", advancePercent: 40, advanceDay: 20 } as const;
    const on20 = planSalary(500_000, 5, split, "2026-09-20");
    expect(on20.ok && on20.items.map((i) => [i.role, i.amountCents, i.startMonth])).toEqual([
      ["advance", 200_000, "2026-09"],
      ["salary", 300_000, "2026-10"],
    ]);
    const on25 = planSalary(500_000, 5, split, "2026-09-25");
    expect(on25.ok && on25.items.map((i) => i.startMonth)).toEqual(["2026-10", "2026-10"]);
    const single = planSalary(500_000, 5, { mode: "single" }, "2026-09-03");
    expect(single.ok && single.items).toEqual([
      { role: "salary", amountCents: 500_000, dayOfMonth: 5, startMonth: "2026-09" },
    ]);
  });
});
