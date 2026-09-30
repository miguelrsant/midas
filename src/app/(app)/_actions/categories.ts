"use server";

import { refresh } from "next/cache";
import { z } from "zod";

import { authedAction, invalid } from "@/lib/actions/server";
import { type ActionResult, fail, ok } from "@/lib/actions/result";
import { CATEGORY_NAME_MAX_LENGTH } from "@/lib/categories";
import {
  type CategoryWriteError,
  createCustomCategory,
  deleteCustomCategory,
  updateCategory,
} from "@/lib/data/categories";

/** Personalização de categorias (docs/design-system/15-categorias.md#personalização). */

const nameSchema = z
  .string()
  .trim()
  .min(1, "Dê um nome para a categoria.")
  .max(CATEGORY_NAME_MAX_LENGTH, `Use no máximo ${CATEGORY_NAME_MAX_LENGTH} caracteres.`);
const iconSchema = z.string().max(40);

const createSchema = z
  .object({ kind: z.enum(["expense", "income"]), name: nameSchema, icon: iconSchema })
  .strict();
const updateSchema = z
  .object({
    id: z.string().max(40),
    name: nameSchema.nullable(),
    icon: iconSchema.nullable(),
    hidden: z.boolean(),
  })
  .strict();

const ERRORS: Record<CategoryWriteError, { field: string; message: string }> = {
  name_taken: { field: "name", message: "Já existe uma categoria com esse nome." },
  limit: { field: "name", message: "Você chegou ao máximo de 30 categorias próprias." },
  not_found: { field: "_", message: "Não achamos essa categoria." },
  invalid: { field: "icon", message: "Escolha um ícone da lista." },
};

function toFailure(error: CategoryWriteError) {
  if (error === "not_found") return fail("not_found");
  const { field, message } = ERRORS[error];
  return { ...fail(error === "limit" ? "limit" : "invalid"), fields: { [field]: message } };
}

export async function createCategoryAction(
  raw: unknown,
): Promise<ActionResult<{ id: string; message: string }>> {
  return authedAction("category.create", async (user) => {
    const parsed = createSchema.safeParse(raw);
    if (!parsed.success) return invalid(parsed.error);
    const result = await createCustomCategory(user.id, parsed.data);
    if (!result.ok) return toFailure(result.error);
    refresh();
    return ok({ id: result.id, message: `Categoria criada: ${parsed.data.name.trim()}.` });
  });
}

export async function updateCategoryAction(
  raw: unknown,
): Promise<ActionResult<{ message: string }>> {
  return authedAction("category.update", async (user) => {
    const parsed = updateSchema.safeParse(raw);
    if (!parsed.success) return invalid(parsed.error);
    const { id, ...input } = parsed.data;
    const result = await updateCategory(user.id, id, input);
    if (!result.ok) return toFailure(result.error);
    refresh();
    return ok({ message: "Categoria alterada." });
  });
}

export async function deleteCategoryAction(
  rawId: unknown,
): Promise<ActionResult<{ message: string }>> {
  return authedAction("category.delete", async (user) => {
    const id = z.string().max(40).safeParse(rawId);
    if (!id.success) return fail("not_found");
    if (!(await deleteCustomCategory(user.id, id.data))) return fail("not_found");
    refresh();
    return ok({ message: "Categoria apagada. Os lançamentos dela foram para Outros." });
  });
}
