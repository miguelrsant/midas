import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "@/lib/auth";

/**
 * Camada de acesso a dados da autenticação. É aqui, no servidor, que a sessão é
 * conferida de verdade (o src/proxy.ts só redireciona quem não tem cookie).
 * Use requireUser() em toda página, Server Action e rota que mostre ou mude dados,
 * e filtre toda consulta pelo user.id que ela devolve.
 */

export const getOptionalSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

export async function requireSession() {
  const session = await getOptionalSession();
  if (!session) redirect("/entrar?sessao=expirada");
  return session;
}

export async function requireUser() {
  return (await requireSession()).user;
}
