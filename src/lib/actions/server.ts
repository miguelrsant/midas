import "server-only";

import { unstable_rethrow } from "next/navigation";
import type { z } from "zod";

import { getOptionalSession } from "@/lib/auth/dal";
import { errorCode, log } from "@/lib/log";
import { consume } from "@/lib/throttle";

import { type ActionFailure, type ActionResult, fail } from "./result";

export type SessionUser = { id: string; name: string; email: string; createdAt: Date };

/** Escritas por pessoa por hora: sobra para uso normal, barra abuso de volume. */
const WRITES_PER_HOUR = { windowMs: 60 * 60 * 1000, max: 600 };

/**
 * Envolve toda Server Action que mexe em dados:
 * - confere a sessão no servidor, sem redirecionar (a tela guarda o que foi digitado);
 * - conta a escrita no limite por pessoa;
 * - transforma erro inesperado em mensagem genérica, logando só o código.
 * Cada ação ainda valida a entrada com Zod e filtra toda consulta pelo user.id.
 */
export async function authedAction<T>(
  route: string,
  run: (user: SessionUser) => Promise<ActionResult<T>>,
  { write = true }: { write?: boolean } = {},
): Promise<ActionResult<T>> {
  let userId: string | undefined;
  try {
    const session = await getOptionalSession();
    if (!session) return fail("session_expired");
    userId = session.user.id;
    if (write && !(await consume(`write:${userId}`, WRITES_PER_HOUR))) return fail("too_many");
    return await run(session.user);
  } catch (error) {
    unstable_rethrow(error);
    log.error("action.failed", { route, userId, code: errorCode(error) });
    return fail("server");
  }
}

/** Erros do Zod viram uma mensagem por campo (a primeira de cada um). */
export function invalid(error: z.ZodError): ActionFailure {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    fields[key] ??= issue.message;
  }
  return { ...fail("invalid"), fields };
}
