import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/dal";
import { loadCategories } from "@/lib/data/categories";
import { listLimits } from "@/lib/data/limits";

import { LimitForm } from "./limit-form";

export const metadata: Metadata = { title: "Limite" };

export default async function LimitPage({ params }: { params: Promise<{ categoria: string }> }) {
  const user = await requireUser();
  const { categoria } = await params;
  const categories = (await loadCategories(user.id)).filter((c) => c.kind === "expense");
  const limits = await listLimits(user.id);
  if (categoria === "novo") {
    const free = categories.filter((c) => !limits.has(c.id) && !c.hidden);
    return <LimitForm categories={free} initialCategoryId={null} initialAmount={null} />;
  }
  if (!categories.some((c) => c.id === categoria)) notFound();
  return (
    <LimitForm
      categories={categories}
      initialCategoryId={categoria}
      initialAmount={limits.get(categoria) ?? null}
    />
  );
}
