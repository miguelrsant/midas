import "server-only";

import { randomUUID } from "node:crypto";

import { cache } from "react";

import {
  capitalizeName,
  type Category,
  CATEGORY_NAME_MAX_LENGTH,
  type CategorySetting,
  CUSTOM_CATEGORY_LIMIT,
  CUSTOM_CATEGORY_RE,
  nameKey,
  OTHER_EXPENSE,
  OTHER_INCOME,
  otherCategory,
  resolveCategories,
  systemCategory,
} from "@/lib/categories";
import { PICKABLE_ICON_KEYS } from "@/lib/category-icons";
import { openText, sealText } from "@/lib/crypto/fields";
import { db } from "@/lib/db";
import { type EntryKind, fromDbKind, toDbKind } from "@/lib/entry";

/**
 * Categorias da pessoa: ajustes das prontas e categorias próprias (A013).
 * Nome e ícone ficam cifrados juntos no campo `sealed`.
 */

const FIELD = "user_category.sealed";

type Sealed = { name?: string | null; icon?: string | null };

export function customCategoryId(rowId: string) {
  return `u-${rowId}`;
}

function rowIdOf(categoryId: string) {
  return categoryId.slice(2);
}

export const loadCategories = cache(async (userId: string): Promise<Category[]> => {
  const rows = await db.userCategory.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { id: true, kind: true, systemId: true, sealed: true, hidden: true },
  });
  const settings: CategorySetting[] = rows.map((row) => {
    let data: Sealed = {};
    if (row.sealed) {
      try {
        data = JSON.parse(openText(row.sealed, { field: FIELD, userId, rowId: row.id })) as Sealed;
      } catch {
        data = {};
      }
    }
    return {
      id: row.systemId ?? customCategoryId(row.id),
      kind: fromDbKind(row.kind),
      systemId: row.systemId,
      name: typeof data.name === "string" ? data.name : null,
      icon: typeof data.icon === "string" && PICKABLE_ICON_KEYS.has(data.icon) ? data.icon : null,
      hidden: row.hidden,
    };
  });
  return resolveCategories(settings);
});

/**
 * Confere se a categoria pode receber um lançamento do tipo: pronta do tipo certo
 * ou própria da pessoa. As de calculadora só valem se já eram as do lançamento.
 */
export async function isUsableCategory(
  userId: string,
  categoryId: string,
  kind: EntryKind,
  { allowCalculator = false }: { allowCalculator?: boolean } = {},
): Promise<boolean> {
  const system = systemCategory(categoryId);
  if (system) return system.kind === kind && (!system.fromCalculator || allowCalculator);
  if (!CUSTOM_CATEGORY_RE.test(categoryId)) return false;
  const found = await db.userCategory.count({
    where: { id: rowIdOf(categoryId), userId, systemId: null, kind: toDbKind(kind) },
  });
  return found === 1;
}

export type CategoryWriteError = "name_taken" | "limit" | "not_found" | "invalid";

function sealCategory(userId: string, rowId: string, data: Sealed) {
  return sealText(JSON.stringify(data), { field: FIELD, userId, rowId });
}

export async function createCustomCategory(
  userId: string,
  input: { kind: EntryKind; name: string; icon: string },
): Promise<{ ok: true; id: string } | { ok: false; error: CategoryWriteError }> {
  const name = capitalizeName(input.name);
  if (!name || name.length > CATEGORY_NAME_MAX_LENGTH || !PICKABLE_ICON_KEYS.has(input.icon)) {
    return { ok: false, error: "invalid" };
  }
  const categories = await loadCategories(userId);
  if (categories.filter((c) => !c.system).length >= CUSTOM_CATEGORY_LIMIT)
    return { ok: false, error: "limit" };
  if (categories.some((c) => c.kind === input.kind && nameKey(c.name) === nameKey(name))) {
    return { ok: false, error: "name_taken" };
  }
  const rowId = randomUUID();
  await db.userCategory.create({
    data: {
      id: rowId,
      userId,
      kind: toDbKind(input.kind),
      systemId: null,
      sealed: sealCategory(userId, rowId, { name, icon: input.icon }),
    },
  });
  return { ok: true, id: customCategoryId(rowId) };
}

/** Muda nome, ícone e "Mostrar no formulário" de uma categoria (pronta ou própria). */
export async function updateCategory(
  userId: string,
  categoryId: string,
  input: { name: string | null; icon: string | null; hidden: boolean },
): Promise<{ ok: true } | { ok: false; error: CategoryWriteError }> {
  const categories = await loadCategories(userId);
  const current = categories.find((c) => c.id === categoryId);
  if (!current || current.fromCalculator) return { ok: false, error: "not_found" };
  const name = input.name ? capitalizeName(input.name) : null;
  if (name && name.length > CATEGORY_NAME_MAX_LENGTH) return { ok: false, error: "invalid" };
  if (input.icon && !PICKABLE_ICON_KEYS.has(input.icon)) return { ok: false, error: "invalid" };
  if (!current.system && !name) return { ok: false, error: "invalid" };
  if (
    name &&
    categories.some(
      (c) => c.id !== categoryId && c.kind === current.kind && nameKey(c.name) === nameKey(name),
    )
  ) {
    return { ok: false, error: "name_taken" };
  }
  const isOther = categoryId === OTHER_EXPENSE || categoryId === OTHER_INCOME;
  const hidden = isOther ? false : input.hidden;

  if (current.system) {
    const system = systemCategory(categoryId)!;
    const cleanName = name && name !== system.name ? name : null;
    const cleanIcon = input.icon && input.icon !== system.icon ? input.icon : null;
    const existing = await db.userCategory.findUnique({
      where: { userId_systemId: { userId, systemId: categoryId } },
      select: { id: true },
    });
    const rowId = existing?.id ?? randomUUID();
    const sealed =
      cleanName || cleanIcon
        ? sealCategory(userId, rowId, { name: cleanName, icon: cleanIcon })
        : null;
    if (!sealed && !hidden) {
      if (existing) await db.userCategory.deleteMany({ where: { id: rowId, userId } });
      return { ok: true };
    }
    await db.userCategory.upsert({
      where: { userId_systemId: { userId, systemId: categoryId } },
      create: {
        id: rowId,
        userId,
        kind: toDbKind(system.kind),
        systemId: categoryId,
        sealed,
        hidden,
      },
      update: { sealed, hidden },
    });
    return { ok: true };
  }

  const rowId = rowIdOf(categoryId);
  const updated = await db.userCategory.updateMany({
    where: { id: rowId, userId, systemId: null },
    data: {
      sealed: sealCategory(userId, rowId, { name, icon: input.icon ?? current.icon }),
      hidden,
    },
  });
  return updated.count === 1 ? { ok: true } : { ok: false, error: "not_found" };
}

/**
 * Apaga uma categoria própria: lançamentos e fixos dela vão para "Outros" do mesmo
 * tipo e o limite dela é removido, tudo numa transação.
 */
export async function deleteCustomCategory(userId: string, categoryId: string): Promise<boolean> {
  if (!CUSTOM_CATEGORY_RE.test(categoryId)) return false;
  const rowId = rowIdOf(categoryId);
  const row = await db.userCategory.findFirst({
    where: { id: rowId, userId, systemId: null },
    select: { kind: true },
  });
  if (!row) return false;
  const other = otherCategory(fromDbKind(row.kind));
  await db.$transaction([
    db.entry.updateMany({ where: { userId, categoryId }, data: { categoryId: other } }),
    db.recurring.updateMany({ where: { userId, categoryId }, data: { categoryId: other } }),
    db.categoryLimit.deleteMany({ where: { userId, categoryId } }),
    db.userCategory.deleteMany({ where: { id: rowId, userId } }),
  ]);
  return true;
}

export async function countEntriesInCategory(userId: string, categoryId: string) {
  return db.entry.count({ where: { userId, categoryId } });
}
