import type { Metadata } from "next";

import { requireUser } from "@/lib/auth/dal";

import { CategoryForm } from "../category-form";

export const metadata: Metadata = { title: "Criar categoria" };

export default async function NewCategoryPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  await requireUser();
  const { tipo } = await searchParams;
  return <CategoryForm mode="new" kind={tipo === "renda" ? "income" : "expense"} />;
}
