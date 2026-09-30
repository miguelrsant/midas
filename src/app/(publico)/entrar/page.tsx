import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { getOptionalSession } from "@/lib/auth/dal";
import { AUTH_MESSAGES } from "@/lib/auth/messages";
import { safeRedirectPath } from "@/lib/safe-redirect";

import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "Entrar" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ de?: string; sessao?: string; senha?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = safeRedirectPath(params.de);
  if (await getOptionalSession()) redirect(redirectTo as never);

  const notice =
    params.sessao === "expirada"
      ? AUTH_MESSAGES.sessionExpired
      : params.senha === "trocada"
        ? "Senha trocada. Entre com a senha nova."
        : null;

  return (
    <AuthShell>
      <SignInForm redirectTo={redirectTo} notice={notice} />
    </AuthShell>
  );
}
