import "server-only";

import { findCategory } from "@/lib/categories";
import { formatShortDate } from "@/lib/dates";
import { db } from "@/lib/db";
import { csvAmount, csvText, toCsv } from "@/lib/export/csv";
import { paymentLabel } from "@/lib/labor/types";

import { loadCategories } from "./categories";
import { toView as entryView } from "./entries";
import { listCalculations, listExpectedIncomes } from "./planning";
import { listRecurring } from "./recurring";

/**
 * "Seus dados" (A009; .lgpd/dsar/workflow.md): o que o Midas guarda, a exportação
 * completa gerada na hora e a exclusão da conta. Toda tabela com userId precisa
 * aparecer em `buildExport` (teste de guarda em guards.integration.test.ts).
 */

export async function accountSummary(userId: string) {
  const [entries, firstEntry, recurrings, limits, categories, calculations, expected] =
    await Promise.all([
      db.entry.count({ where: { userId } }),
      db.entry.findFirst({ where: { userId }, orderBy: { date: "asc" }, select: { date: true } }),
      db.recurring.count({ where: { userId } }),
      db.categoryLimit.count({ where: { userId } }),
      db.userCategory.count({ where: { userId, systemId: null } }),
      db.calculation.count({ where: { userId } }),
      db.expectedIncome.count({ where: { userId } }),
    ]);
  return {
    entries,
    firstEntry: firstEntry?.date ?? null,
    recurrings,
    limits,
    categories,
    calculations,
    expected,
  };
}

/** Modelos com userId que a exportação cobre (usado pelo teste de guarda). */
export const EXPORTED_MODELS = [
  "Session",
  "Account",
  "SecurityEvent",
  "Entry",
  "Recurring",
  "UserCategory",
  "CategoryLimit",
  "Calculation",
  "ExpectedIncome",
  "UserPreference",
] as const;

export async function buildExport(userId: string, now = new Date()) {
  const user = await db.user.findUniqueOrThrow({
    where: { id: userId },
    select: { name: true, email: true, createdAt: true, termsVersion: true, termsAcceptedAt: true },
  });
  const [
    sessions,
    events,
    entryRows,
    recurrings,
    limits,
    expected,
    calculations,
    preference,
    categories,
  ] = await Promise.all([
    db.session.findMany({
      where: { userId },
      select: { userAgent: true, createdAt: true, updatedAt: true },
    }),
    db.securityEvent.findMany({
      where: { userId },
      select: { type: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    db.entry.findMany({
      where: { userId },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        kind: true,
        amountCents: true,
        categoryId: true,
        description: true,
        date: true,
        recurringId: true,
        createdAt: true,
      },
    }),
    listRecurring(userId),
    db.categoryLimit.findMany({
      where: { userId },
      select: { categoryId: true, amountCents: true },
    }),
    listExpectedIncomes(userId),
    listCalculations(userId),
    db.userPreference.findUnique({ where: { userId }, select: { lastSummaryOpenedMonth: true } }),
    loadCategories(userId),
  ]);
  const entries = entryRows.map((row) => entryView(userId, row));
  const categoryName = (id: string) => findCategory(categories, id).name;
  const reais = (cents: number) => csvAmount(cents);

  const data = {
    formato: 1,
    geradoEm: now.toISOString(),
    aviso: "Arquivo com todos os seus dados guardados no Midas. Valores em centavos e em reais.",
    conta: {
      apelido: user.name,
      email: user.email,
      criadaEm: user.createdAt.toISOString(),
      versaoDosTermos: user.termsVersion,
      termosAceitosEm: user.termsAcceptedAt?.toISOString() ?? null,
    },
    aparelhos: sessions.map((s) => ({
      aparelho: s.userAgent ?? "Aparelho desconhecido",
      entrouEm: s.createdAt.toISOString(),
      ultimoUso: s.updatedAt.toISOString(),
    })),
    eventosDeSeguranca: events.map((e) => ({ tipo: e.type, em: e.createdAt.toISOString() })),
    categoriasProprias: categories
      .filter((c) => !c.system)
      .map((c) => ({
        id: c.id,
        tipo: c.kind === "income" ? "renda" : "gasto",
        nome: c.name,
        icone: c.icon,
        escondida: c.hidden,
      })),
    ajustesDeCategorias: categories
      .filter((c) => c.system && !c.fromCalculator)
      .map((c) => ({ id: c.id, nome: c.name, icone: c.icon, escondida: c.hidden })),
    lancamentos: entries.map((e) => ({
      id: e.id,
      data: e.date,
      tipo: e.kind === "income" ? "renda" : "gasto",
      categoriaId: e.categoryId,
      categoria: categoryName(e.categoryId),
      descricao: e.description,
      valorCentavos: e.amountCents,
      valorReais: reais(e.amountCents),
      doFixo: e.recurringId,
      criadoEm: e.createdAt.toISOString(),
    })),
    fixos: recurrings.map((r) => ({
      id: r.id,
      tipo: r.kind === "income" ? "renda" : "gasto",
      categoriaId: r.categoryId,
      categoria: categoryName(r.categoryId),
      nome: r.description,
      valorCentavos: r.amountCents,
      diaDoMes: r.dayOfMonth,
      mesInicial: r.startMonth,
      mesFinal: r.endMonth,
      proximaVez: r.nextOccurrenceOn,
      adiantamentoDoSalario: r.salaryId,
    })),
    limites: limits.map((l) => ({
      categoriaId: l.categoryId,
      categoria: categoryName(l.categoryId),
      valorMensalCentavos: l.amountCents,
    })),
    rendasPrevistas: expected.map((x) => ({
      id: x.id,
      nome: paymentLabel(x.labelKey),
      categoriaId: x.categoryId,
      valorCentavos: x.amountCents,
      ate: x.dueDate,
      contaDeCalculadora: x.calculationId,
    })),
    contasDeCalculadora: calculations.map((c) => ({
      id: c.id,
      tipo: c.kind,
      feitaEm: c.createdAt.toISOString(),
      respostas: c.data?.input ?? null,
      resultado: c.data?.result ?? null,
    })),
    preferencias: { ultimoResumoAberto: preference?.lastSummaryOpenedMonth ?? null },
  };

  const csv = toCsv(
    ["data", "tipo", "categoria_id", "categoria", "descricao", "valor"],
    entries.map((e) => [
      csvText(e.date),
      csvText(e.kind === "income" ? "renda" : "gasto"),
      csvText(e.categoryId),
      csvText(categoryName(e.categoryId)),
      csvText(e.description),
      csvAmount(e.kind === "income" ? e.amountCents : -e.amountCents),
    ]),
  );

  const day = now.toISOString().slice(0, 10);
  return {
    fileBase: `midas-dados-${day}`,
    json: JSON.stringify(data, null, 2),
    csv,
    label: formatShortDate(now),
  };
}

/**
 * Apaga a conta numa transação: registra o id para reaplicar exclusões depois de um
 * restore, apaga as verificações pendentes e apaga o usuário (cascata em todas as
 * tabelas com userId).
 */
export async function deleteAccountData(userId: string) {
  await db.$transaction([
    db.deletedAccount.create({ data: { id: userId } }),
    db.verification.deleteMany({ where: { value: userId } }),
    db.user.delete({ where: { id: userId } }),
  ]);
}
