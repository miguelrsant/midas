import type { Metadata } from "next";
import Link from "next/link";

import { Accent, AuthShell, AuthTitle } from "@/components/auth/auth-shell";
import { buttonClasses } from "@/components/ui/button";
import { getOptionalSession } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Confirmar e-mail" };

/** Para onde o link de confirmação leva depois de validar o token (ou com ?error= se falhar). */
export default async function ConfirmEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const session = await getOptionalSession();

  if (error || !session) {
    return (
      <AuthShell>
        <AuthTitle>Esse link venceu.</AuthTitle>
        <p className="text-center">
          O link de confirmação vale por 24 horas. Entre com seu e-mail e senha: se a conta ainda
          não estiver confirmada, mandamos um link novo.
        </p>
        <Link href="/entrar" className={buttonClasses({ size: "lg", fullWidth: true })}>
          Ir para a entrada
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <AuthTitle>
        Conta <Accent>confirmada</Accent>.
      </AuthTitle>
      <p className="text-center">
        Tudo pronto. Agora é só começar a anotar o que entra e o que sai.
      </p>
      <Link href="/" className={buttonClasses({ size: "lg", fullWidth: true })}>
        Ir para o início
      </Link>
    </AuthShell>
  );
}
