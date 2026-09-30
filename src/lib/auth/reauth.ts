import "server-only";

import { db } from "@/lib/db";
import { consume, refund } from "@/lib/throttle";

import { verifyPassword } from "./password";
import { PASSWORD_MAX_LENGTH } from "./password-rules";

/**
 * Pedir a senha de novo antes de ações sensíveis (baixar os dados, apagar a conta).
 * Usa o mesmo contador por conta da troca de senha (`pwcheck:<userId>`): quem acha
 * uma sessão aberta não consegue ficar testando palpites.
 */
export const PASSWORD_CHECK_PER_ACCOUNT = { windowMs: 60 * 60 * 1000, max: 10 };

export type ReauthResult = "ok" | "wrong" | "limited";

export async function verifyCurrentPassword(
  userId: string,
  password: string,
): Promise<ReauthResult> {
  if (!password || password.length > PASSWORD_MAX_LENGTH * 4) return "wrong";
  if (!(await consume(`pwcheck:${userId}`, PASSWORD_CHECK_PER_ACCOUNT))) return "limited";
  const account = await db.account.findFirst({
    where: { userId, providerId: "credential" },
    select: { password: true },
  });
  const ok = account?.password ? await verifyPassword({ hash: account.password, password }) : false;
  if (!ok) return "wrong";
  await refund(`pwcheck:${userId}`);
  return "ok";
}
