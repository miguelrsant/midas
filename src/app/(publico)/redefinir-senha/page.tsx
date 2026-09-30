import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";

import { ExpiredLink, ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = { title: "Criar senha nova" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;
  const valid = !error && typeof token === "string" && /^[\w-]{16,128}$/.test(token);
  return <AuthShell>{valid ? <ResetPasswordForm token={token} /> : <ExpiredLink />}</AuthShell>;
}
