import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";

import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { db } from "@/lib/db";
import { addDays, addMonths, clampDay, monthOf, todayInSaoPaulo } from "@/lib/dates";

import { buildExport, deleteAccountData, EXPORTED_MODELS } from "./account";
import {
  createCustomCategory,
  deleteCustomCategory,
  isUsableCategory,
  loadCategories,
} from "./categories";
import { createEntry, deleteEntry, entryFacts, getEntry, updateEntry } from "./entries";
import { loadOverview } from "./overview";
import { addCalculationToPlan, listExpectedIncomes, receiveExpectedIncome } from "./planning";
import {
  createRecurring,
  createRecurringWithinLimit,
  deleteRecurring,
  ensureRecurringUpToDate,
  getSalaryGroup,
  listRecurring,
  saveSalary,
} from "./recurring";

/*
 * Camada de dados contra o Postgres de teste (midas_test): isolamento entre contas,
 * idempotência, fixos sem duplicar, CHECKs do banco e cobertura da exportação e da
 * exclusão para toda tabela com userId.
 */

async function makeUser(label: string) {
  const id = `test-${label}-${randomUUID()}`;
  await db.user.create({
    data: {
      id,
      name: label,
      email: `${id}@exemplo.test`,
      emailVerified: true,
      termsVersion: "2026-09-30",
    },
  });
  return id;
}

const today = todayInSaoPaulo();
const entry = (overrides: Partial<Parameters<typeof createEntry>[2]> = {}) => ({
  kind: "expense" as const,
  amountCents: 12_790,
  categoryId: "mercado",
  description: "Farmácia do bairro",
  date: today,
  ...overrides,
});

beforeEach(async () => {
  await db.user.deleteMany({ where: { id: { startsWith: "test-" } } });
  await db.deletedAccount.deleteMany({ where: { id: { startsWith: "test-" } } });
});

afterAll(async () => {
  await db.user.deleteMany({ where: { id: { startsWith: "test-" } } });
  await db.$disconnect();
});

describe("guardas de LGPD", () => {
  it("toda tabela com userId está na exportação", () => {
    const schema = readFileSync("prisma/schema.prisma", "utf8");
    const withUser = [...schema.matchAll(/^model (\w+) \{([\s\S]*?)^\}/gm)]
      .filter(([, , body]) => /^\s+userId\s/m.test(body ?? ""))
      .map(([, name]) => name!)
      .sort();
    expect(withUser).toEqual([...EXPORTED_MODELS].sort());
  });

  it("toda chave estrangeira para user apaga em cascata", async () => {
    const rows = await db.$queryRaw<Array<{ table: string; confdeltype: string }>>`
      SELECT conrelid::regclass::text AS table, confdeltype::text AS confdeltype
      FROM pg_constraint WHERE contype = 'f' AND confrelid = '"user"'::regclass`;
    expect(rows.length).toBeGreaterThanOrEqual(10);
    for (const row of rows)
      expect({ table: row.table, cascade: row.confdeltype }).toEqual({
        table: row.table,
        cascade: "c",
      });
  });
});

describe("lançamentos", () => {
  it("cifra a descrição no banco e abre para a dona", async () => {
    const a = await makeUser("a");
    const id = randomUUID();
    await createEntry(a, id, entry());
    const raw = await db.entry.findUniqueOrThrow({ where: { id }, select: { description: true } });
    expect(raw.description).not.toContain("Farm");
    expect((await getEntry(a, id))?.description).toBe("Farmácia do bairro");
  });

  it("salvar duas vezes com o mesmo id não duplica", async () => {
    const a = await makeUser("a");
    const id = randomUUID();
    expect((await createEntry(a, id, entry())).status).toBe("created");
    expect((await createEntry(a, id, entry())).status).toBe("replayed");
    expect(await db.entry.count({ where: { userId: a } })).toBe(1);
  });

  it("outra conta não lê, não edita, não apaga e não sequestra o id", async () => {
    const a = await makeUser("a");
    const b = await makeUser("b");
    const id = randomUUID();
    await createEntry(a, id, entry());
    expect(await getEntry(b, id)).toBeNull();
    expect(await updateEntry(b, id, entry({ amountCents: 1 }))).toBeNull();
    expect(await deleteEntry(b, id)).toBeNull();
    expect((await createEntry(b, id, entry({ amountCents: 1 }))).status).toBe("conflict");
    expect((await getEntry(a, id))?.amountCents).toBe(12_790);
  });

  it("o banco recusa valor zero, negativo ou acima de int4", async () => {
    const a = await makeUser("a");
    for (const amountCents of [0, -5, 1_000_000_000]) {
      await expect(createEntry(a, randomUUID(), entry({ amountCents }))).rejects.toThrow();
    }
  });

  it("somas acima de 2^31 continuam exatas", async () => {
    const a = await makeUser("a");
    for (let i = 0; i < 3; i++)
      await createEntry(a, randomUUID(), entry({ amountCents: 999_999_999, description: null }));
    const facts = await entryFacts(a, monthOf(today), monthOf(today));
    expect(facts.reduce((s, f) => s + f.amountCents, 0)).toBe(2_999_999_997);
  });
});

describe("categorias próprias", () => {
  it("só a dona usa; apagar leva os lançamentos para Outros", async () => {
    const a = await makeUser("a");
    const b = await makeUser("b");
    const created = await createCustomCategory(a, {
      kind: "expense",
      name: "remédios",
      icon: "remedio",
    });
    if (!created.ok) throw new Error("não criou");
    expect((await loadCategories(a)).find((c) => c.id === created.id)?.name).toBe("Remédios");
    expect(await isUsableCategory(a, created.id, "expense")).toBe(true);
    expect(await isUsableCategory(b, created.id, "expense")).toBe(false);
    expect(await isUsableCategory(a, created.id, "income")).toBe(false);
    expect(await isUsableCategory(a, "decimo-terceiro", "income")).toBe(false);

    const id = randomUUID();
    await createEntry(a, id, entry({ categoryId: created.id }));
    expect(await deleteCustomCategory(b, created.id)).toBe(false);
    expect(await deleteCustomCategory(a, created.id)).toBe(true);
    expect((await getEntry(a, id))?.categoryId).toBe("outros-gasto");
  });

  it("não repete nome e respeita o teto", async () => {
    const a = await makeUser("a");
    await createCustomCategory(a, { kind: "expense", name: "Academia", icon: "academia" });
    expect(
      await createCustomCategory(a, { kind: "expense", name: "academia", icon: "academia" }),
    ).toEqual({
      ok: false,
      error: "name_taken",
    });
  });
});

describe("fixos", () => {
  it("anota as ocorrências vencidas uma vez só, mesmo com duas abas ao mesmo tempo", async () => {
    const a = await makeUser("a");
    const start = addMonths(monthOf(today), -2);
    const aluguel = await createRecurring(a, {
      kind: "expense",
      amountCents: 165_000,
      categoryId: "moradia",
      description: "Aluguel",
      dayOfMonth: 1,
      startMonth: start,
      repeat: { mode: "monthly" },
    });
    // Simula um fixo criado há 2 meses (um fixo nunca anota antes do mês em que foi criado).
    await db.recurring.update({
      where: { id: aluguel.id },
      data: { createdAt: new Date(`${start}-01T12:00:00Z`) },
    });
    await Promise.all([ensureRecurringUpToDate(a, today), ensureRecurringUpToDate(a, today)]);
    const entries = await db.entry.findMany({
      where: { userId: a },
      select: { id: true, date: true },
    });
    expect(entries).toHaveLength(3);
    await ensureRecurringUpToDate(a, today);
    expect(await db.entry.count({ where: { userId: a } })).toBe(3);

    // Excluir uma ocorrência não a traz de volta.
    await deleteEntry(a, entries[0]!.id);
    await ensureRecurringUpToDate(a, today);
    expect(await db.entry.count({ where: { userId: a } })).toBe(2);
    expect((await getEntry(a, entries[1]!.id))?.description).toBe("Aluguel");
  });

  it("parcelas param no último mês", async () => {
    const a = await makeUser("a");
    const start = addMonths(monthOf(today), -5);
    const r = await createRecurring(a, {
      kind: "expense",
      amountCents: 25_000,
      categoryId: "compras",
      description: "Geladeira",
      dayOfMonth: 31,
      startMonth: start,
      repeat: { mode: "installments", count: 3 },
    });
    await db.recurring.update({
      where: { id: r.id },
      data: { createdAt: new Date(`${start}-01T12:00:00Z`) },
    });
    await ensureRecurringUpToDate(a, today);
    const dates = (
      await db.entry.findMany({
        where: { userId: a },
        select: { date: true },
        orderBy: { date: "asc" },
      })
    ).map((e) => e.date.toISOString().slice(0, 10));
    expect(dates).toEqual([0, 1, 2].map((i) => clampDay(addMonths(start, i), 31)));
    expect(
      (await db.recurring.findUniqueOrThrow({ where: { id: r.id } })).nextOccurrenceOn,
    ).toBeNull();
  });
});

describe("defesas da revisão de segurança", () => {
  it("fixo nunca anota meses anteriores à criação, mesmo com início no passado", async () => {
    const a = await makeUser("a");
    await createRecurring(a, {
      kind: "expense",
      amountCents: 1_000,
      categoryId: "contas",
      description: null,
      dayOfMonth: 5,
      startMonth: addMonths(monthOf(today), -24),
      repeat: { mode: "monthly" },
    });
    await ensureRecurringUpToDate(a, today);
    const months = (await db.entry.findMany({ where: { userId: a }, select: { date: true } })).map(
      (e) => e.date.toISOString().slice(0, 7),
    );
    expect(months.every((m) => m >= monthOf(today))).toBe(true);
  });

  it("tetos de categorias e fixos valem com pedidos ao mesmo tempo", async () => {
    const a = await makeUser("a");
    const results = await Promise.all(
      Array.from({ length: 35 }, (_, i) =>
        createCustomCategory(a, { kind: "expense", name: `Cat ${i}`, icon: "moradia" }),
      ),
    );
    expect(results.filter((r) => r.ok)).toHaveLength(30);
    expect(await db.userCategory.count({ where: { userId: a, systemId: null } })).toBe(30);

    const item = {
      input: {
        kind: "expense" as const,
        amountCents: 100,
        categoryId: "contas",
        description: null,
        dayOfMonth: 5,
        startMonth: monthOf(today),
        repeat: { mode: "monthly" as const },
      },
    };
    await Promise.all(Array.from({ length: 105 }, () => createRecurringWithinLimit(a, [item])));
    expect(await db.recurring.count({ where: { userId: a } })).toBe(100);
  });

  it("a exportação traz todas as contas de calculadora", async () => {
    const a = await makeUser("a");
    for (let i = 0; i < 21; i++) {
      await addCalculationToPlan(
        a,
        randomUUID(),
        "NET_SALARY",
        { input: {}, result: {} as never, engineVersion: 1 },
        [],
      );
    }
    expect(JSON.parse((await buildExport(a)).json).contasDeCalculadora).toHaveLength(21);
  });
});

describe("calculadoras e rendas previstas", () => {
  it("guarda uma vez só e 'Recebi' vira lançamento", async () => {
    const a = await makeUser("a");
    const id = randomUUID();
    const payments = [
      { labelKey: "ferias", categoryId: "ferias" as const, cents: 387_400, dueDate: today },
    ];
    const stored = { input: {}, result: {} as never, engineVersion: 1 };
    expect(await addCalculationToPlan(a, id, "VACATION", stored, payments)).toBe("created");
    expect(await addCalculationToPlan(a, id, "VACATION", stored, payments)).toBe("replayed");
    const [expected] = await listExpectedIncomes(a);
    const entryId = randomUUID();
    expect(
      await receiveExpectedIncome(a, expected!.id, entryId, {
        amountCents: 390_000,
        date: today,
        description: "Férias",
      }),
    ).toBe(true);
    expect(
      await receiveExpectedIncome(a, expected!.id, randomUUID(), {
        amountCents: 1,
        date: today,
        description: "x",
      }),
    ).toBe(false);
    expect((await getEntry(a, entryId))?.categoryId).toBe("ferias");
    expect(await listExpectedIncomes(a)).toHaveLength(0);
  });
});

describe("rendas previstas no gráfico", () => {
  const stored = { input: {}, result: {} as never, engineVersion: 1 };
  const current = monthOf(today);

  it("atrasada conta no mês atual, e 'Recebi' não conta duas vezes", async () => {
    const a = await makeUser("a");
    const lastMonthDay = clampDay(addMonths(current, -1), 15);
    await addCalculationToPlan(a, randomUUID(), "TERMINATION", stored, [
      {
        labelKey: "rescisao",
        categoryId: "rescisao" as const,
        cents: 400_000,
        dueDate: lastMonthDay,
      },
    ]);
    const before = (await loadOverview(a, current)).projection.currentPoint;
    expect(before.income.pendingCents).toBe(400_000);
    expect(before.incomeCents).toBe(400_000);

    const [expected] = await listExpectedIncomes(a);
    await receiveExpectedIncome(a, expected!.id, randomUUID(), {
      amountCents: 400_000,
      date: today,
      description: "Rescisão",
    });
    const after = (await loadOverview(a, current)).projection.currentPoint;
    expect(after.income).toEqual({ fixedCents: 400_000, variableCents: 0, pendingCents: 0 });
    expect(after.incomeCents).toBe(400_000);
  });

  it("quem só usou a calculadora já vê a projeção", async () => {
    const a = await makeUser("a");
    const due = addDays(clampDay(addMonths(current, 2), 1), 9);
    await addCalculationToPlan(a, randomUUID(), "VACATION", stored, [
      { labelKey: "ferias", categoryId: "ferias" as const, cents: 387_400, dueDate: due },
    ]);
    const { projection } = await loadOverview(a, current);
    expect(projection.hasHistory).toBe(false);
    expect(projection.future(monthOf(due))?.incomeCents).toBe(387_400);
  });
});

describe("salário dividido", () => {
  const current = monthOf(today);
  const plan = [
    { role: "advance" as const, amountCents: 200_000, dayOfMonth: 20, startMonth: current },
    { role: "salary" as const, amountCents: 300_000, dayOfMonth: 5, startMonth: current },
  ];

  it("cria os dois ligados, que somam o líquido, e anota os dois", async () => {
    const a = await makeUser("a");
    const saved = await saveSalary(a, null, plan, "Salário");
    expect(saved?.advance?.salaryId).toBe(saved?.salary.id);
    const rows = await listRecurring(a);
    expect(rows.reduce((s, r) => s + r.amountCents, 0)).toBe(500_000);
    const far = addDays(clampDay(addMonths(current, 1), 28), 0);
    expect(await ensureRecurringUpToDate(a, far)).toBe(4);
  });

  it("editar de um para dois e de volta, sempre pelo salário", async () => {
    const a = await makeUser("a");
    const single = await saveSalary(a, null, [plan[1]!], "Salário");
    const split = await saveSalary(a, single!.salary.id, plan, "Salário");
    expect(split?.advance?.amountCents).toBe(200_000);
    expect((await getSalaryGroup(a, split!.advance!.id))?.salary.id).toBe(single!.salary.id);
    const back = await saveSalary(a, single!.salary.id, [plan[1]!], "Salário");
    expect(back?.advance).toBeNull();
    expect(await listRecurring(a)).toHaveLength(1);
  });

  it("parar o adiantamento ou o salário apaga os dois", async () => {
    const a = await makeUser("a");
    const one = await saveSalary(a, null, plan, "Salário");
    expect(await deleteRecurring(a, one!.advance!.id)).toBe(true);
    expect(await listRecurring(a)).toHaveLength(0);
    const two = await saveSalary(a, null, plan, "Salário");
    expect(await deleteRecurring(a, two!.salary.id)).toBe(true);
    expect(await listRecurring(a)).toHaveLength(0);
  });

  it("outra conta não lê, não edita e não apaga", async () => {
    const a = await makeUser("a");
    const b = await makeUser("b");
    const saved = await saveSalary(a, null, plan, "Salário");
    expect(await getSalaryGroup(b, saved!.salary.id)).toBeNull();
    expect(await saveSalary(b, saved!.salary.id, plan, "x")).toBeNull();
    expect(await deleteRecurring(b, saved!.advance!.id)).toBe(false);
    expect(await listRecurring(a)).toHaveLength(2);
    expect(await listRecurring(b)).toHaveLength(0);
  });

  it("os dois contam no teto de fixos", async () => {
    const a = await makeUser("a");
    await createRecurringWithinLimit(
      a,
      Array.from({ length: 99 }, () => ({
        input: {
          kind: "expense" as const,
          amountCents: 100,
          categoryId: "mercado",
          description: null,
          dayOfMonth: 1,
          startMonth: current,
          repeat: { mode: "monthly" as const },
        },
      })),
    );
    expect(await saveSalary(a, null, plan, "Salário")).toBeNull();
    expect(await saveSalary(a, null, [plan[1]!], "Salário")).not.toBeNull();
  });
});

describe("Seus dados", () => {
  it("exporta tudo decifrado e CSV sem fórmula", async () => {
    const a = await makeUser("a");
    await createEntry(a, randomUUID(), entry({ description: "=HYPERLINK(1)" }));
    const file = await buildExport(a);
    const json = JSON.parse(file.json);
    expect(json.lancamentos[0].descricao).toBe("=HYPERLINK(1)");
    expect(file.csv).toContain(`"'=HYPERLINK(1)"`);
    expect(file.csv.startsWith("﻿")).toBe(true);
  });

  it("apagar a conta leva tudo junto e guarda só o id", async () => {
    const a = await makeUser("a");
    await createEntry(a, randomUUID(), entry());
    await createCustomCategory(a, { kind: "expense", name: "Academia", icon: "academia" });
    await deleteAccountData(a);
    expect(await db.user.count({ where: { id: a } })).toBe(0);
    expect(await db.entry.count({ where: { userId: a } })).toBe(0);
    expect(await db.userCategory.count({ where: { userId: a } })).toBe(0);
    expect(await db.deletedAccount.count({ where: { id: a } })).toBe(1);
  });
});
