import "server-only";

import { randomBytes } from "node:crypto";

import type { createAuthMiddleware } from "better-auth/api";

import { hashKey } from "@/lib/throttle";

/**
 * Cookie de aparelho conhecido (OWASP, Authentication Cheat Sheet, "Device Cookies").
 *
 * O limite de tentativas por conta impede adivinhar a senha de muitos IPs, mas deixaria
 * qualquer pessoa trancar a conta de outra só errando a senha dela. Com este cookie, o
 * aparelho em que a pessoa já entrou tem uma contagem própria: quem ataca de fora trava
 * só os aparelhos desconhecidos, nunca o de sempre.
 *
 * Guarda um HMAC do e-mail (nunca o e-mail) e um número aleatório, assinado com o segredo
 * do servidor. Não identifica a pessoa para ninguém de fora e não serve para entrar: só
 * separa a contagem de tentativas. Estritamente necessário, sem consentimento
 * (.lgpd/legal-basis.md). Só vai para `/api/auth`.
 */

type AuthContext = Parameters<Parameters<typeof createAuthMiddleware>[0]>[0];

const COOKIE = "device";
const MAX_AGE = 365 * 24 * 60 * 60;

function cookie(ctx: AuthContext) {
  return ctx.context.createAuthCookie(COOKIE, { maxAge: MAX_AGE, path: "/api/auth" });
}

function owner(email: string): string {
  return hashKey(`device:${email.trim().toLowerCase()}`);
}

/** O número do aparelho, se o cookie é válido e deste e-mail; senão, `null`. */
export async function knownDevice(ctx: AuthContext, email: string): Promise<string | null> {
  const value = await ctx.getSignedCookie(cookie(ctx).name, ctx.context.secret);
  if (!value) return null;
  const [cookieOwner, device] = value.split(".");
  return cookieOwner === owner(email) && device ? device : null;
}

/** Marca o aparelho como conhecido depois de uma entrada certa, mantendo o número dele. */
export async function rememberDevice(ctx: AuthContext, email: string): Promise<void> {
  const device = (await knownDevice(ctx, email)) ?? randomBytes(12).toString("base64url");
  const { name, attributes } = cookie(ctx);
  await ctx.setSignedCookie(name, `${owner(email)}.${device}`, ctx.context.secret, attributes);
}
