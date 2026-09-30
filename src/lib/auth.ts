import "server-only";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { after } from "next/server";

import { db } from "@/lib/db";
import {
  existingAccountMessage,
  passwordChangedMessage,
  resetPasswordMessage,
  verifyEmailMessage,
} from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/sender";
import { env } from "@/lib/env";
import { TERMS_VERSION } from "@/lib/legal";
import { checkNickname } from "@/lib/validation";
import { errorCode, log } from "@/lib/log";
import { maybePurgeExpiredData } from "@/lib/maintenance";
import { consume, emailKey } from "@/lib/throttle";

import { deviceLabel } from "./auth/device";
import { hashPassword, verifyPassword } from "./auth/password";
import { checkPasswordLocally, isPasswordBreached } from "./auth/password-policy";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "./auth/password-rules";
import { recordSecurityEvent } from "./auth/security-events";

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Tentativas de entrada por conta, somando todos os IPs. O limite por IP (abaixo) não
 * segura um ataque distribuído contra um e-mail só. Conta toda tentativa, certa ou
 * errada, exista a conta ou não: assim a resposta não revela quem tem conta.
 */
const SIGN_IN_PER_ACCOUNT = { windowMs: HOUR * 1000, max: 10 };
const EMAIL_MAX_LENGTH = 254;

/** Rotas em que uma senha nova é escolhida, e o campo que a carrega. */
const NEW_PASSWORD_FIELDS: Record<string, "password" | "newPassword"> = {
  "/sign-up/email": "password",
  "/change-password": "newPassword",
  "/reset-password": "newPassword",
};

/**
 * Roda depois que a resposta sai (e-mails, registros). Na Vercel, o `after` do Next
 * mantém a função viva até terminar. Fora de uma requisição (testes), só espera.
 */
function runInBackground(promise: Promise<unknown>) {
  const safe = promise.catch((error: unknown) =>
    log.error("background.failed", { code: errorCode(error) }),
  );
  try {
    after(() => safe);
  } catch {
    void safe;
  }
}

export const auth = betterAuth({
  appName: "Midas",
  baseURL: env.APP_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, { provider: "postgresql" }),
  // Só o próprio app pode chamar a API de autenticação.
  trustedOrigins: [env.APP_URL],
  telemetry: { enabled: false },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    // Sem entrar direto no cadastro: a conta só vale depois de confirmar o e-mail.
    autoSignIn: false,
    minPasswordLength: PASSWORD_MIN_LENGTH,
    maxPasswordLength: PASSWORD_MAX_LENGTH,
    password: { hash: hashPassword, verify: verifyPassword },
    resetPasswordTokenExpiresIn: 30 * MINUTE,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      runInBackground(sendEmail(resetPasswordMessage(user.email, url), "reset-password"));
    },
    onPasswordReset: async ({ user }) => {
      await recordSecurityEvent(user.id, "PASSWORD_RESET");
      runInBackground(
        sendEmail(
          passwordChangedMessage(user.email, `${env.APP_URL}/recuperar-senha`),
          "password-changed",
        ),
      );
    },
    // Cadastro com e-mail que já existe: a tela responde igual, e a pessoa dona do
    // e-mail recebe um aviso. Assim ninguém descobre quem usa o Midas.
    onExistingUserSignUp: async ({ user }) => {
      runInBackground(
        sendEmail(
          existingAccountMessage(
            user.email,
            `${env.APP_URL}/entrar`,
            `${env.APP_URL}/recuperar-senha`,
          ),
          "existing-account",
        ),
      );
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    // Se a pessoa tentar entrar sem confirmar, um link novo é enviado.
    sendOnSignIn: true,
    // Sem entrar pelo link: quem criou a conta com o e-mail de outra pessoa conhece a
    // senha, e a dona do e-mail, ao confirmar, entraria numa conta que não é só dela.
    autoSignInAfterVerification: false,
    expiresIn: DAY,
    sendVerificationEmail: async ({ user, url }) => {
      runInBackground(sendEmail(verifyEmailMessage(user.email, url), "verify-email"));
    },
  },

  user: {
    additionalFields: {
      termsVersion: { type: "string", required: true, input: true },
      termsAcceptedAt: { type: "date", required: false, input: false },
    },
  },

  session: {
    expiresIn: 30 * DAY,
    updateAge: DAY,
    // Sem cache em cookie: revogar uma sessão vale na hora.
    cookieCache: { enabled: false },
  },

  // Tokens de confirmação e de nova senha guardados só como hash.
  verification: { storeIdentifier: "hashed" },

  rateLimit: {
    enabled: true,
    storage: "database",
    window: MINUTE,
    max: 60,
    customRules: {
      "/sign-in/email": { window: 15 * MINUTE, max: 5 },
      "/sign-up/email": { window: HOUR, max: 5 },
      "/request-password-reset": { window: HOUR, max: 3 },
      "/send-verification-email": { window: HOUR, max: 3 },
      "/reset-password": { window: 15 * MINUTE, max: 5 },
      "/change-password": { window: 15 * MINUTE, max: 5 },
    },
  },

  advanced: {
    cookiePrefix: "midas",
    useSecureCookies: env.SECURE_COOKIES,
    defaultCookieAttributes: { httpOnly: true, sameSite: "lax", path: "/" },
    // Na Vercel, x-real-ip e x-forwarded-for são definidos pela própria plataforma.
    // Fora dela, ponha na frente um proxy que sobrescreva x-real-ip (ou configure
    // trustedProxies): sem isso, o cabeçalho pode ser forjado, ou todo mundo cai num
    // contador só e 5 erros travam a entrada de todas as pessoas (README, "Hospedar").
    ipAddress: { ipAddressHeaders: ["x-real-ip", "x-forwarded-for"] },
    backgroundTasks: { handler: runInBackground },
  },

  logger: {
    // O logger padrão pode imprimir detalhes da requisição; aqui só sai o código.
    level: env.IS_PRODUCTION ? "error" : "warn",
    log: (level, message) => {
      const code = message.slice(0, 80).replace(/[^\w .:-]/g, "");
      if (level === "error") log.error("auth.error", { code });
      else log.warn("auth.warn", { code });
    },
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-in/email") {
        const email = (ctx.body as { email?: unknown } | undefined)?.email;
        if (
          typeof email === "string" &&
          !(await consume(emailKey("signin", email), SIGN_IN_PER_ACCOUNT))
        ) {
          throw new APIError("TOO_MANY_REQUESTS", {
            message: "Too many requests",
            code: "TOO_MANY_ATTEMPTS",
          });
        }
      }

      if (ctx.path === "/sign-up/email") {
        const body = ctx.body as {
          email?: unknown;
          name?: unknown;
          termsVersion?: unknown;
          image?: unknown;
        };
        // O banco guarda até 254 (RFC 5321); maior que isso seria um erro 500.
        if (typeof body.email === "string" && body.email.length > EMAIL_MAX_LENGTH) {
          throw new APIError("BAD_REQUEST", { message: "Invalid email", code: "INVALID_EMAIL" });
        }
        if (body.termsVersion !== TERMS_VERSION) {
          throw new APIError("BAD_REQUEST", {
            message: "Terms not accepted",
            code: "TERMS_NOT_ACCEPTED",
          });
        }
        if (typeof body.name !== "string" || checkNickname(body.name).error) {
          throw new APIError("BAD_REQUEST", {
            message: "Invalid nickname",
            code: "INVALID_NICKNAME",
          });
        }
      }

      if (ctx.path === "/update-user") {
        const body = ctx.body as Record<string, unknown>;
        // O Midas não guarda foto; só o apelido pode mudar por aqui.
        if (Object.keys(body).some((key) => key !== "name")) {
          throw new APIError("BAD_REQUEST", {
            message: "Only name can be updated",
            code: "INVALID_FIELDS",
          });
        }
        if (typeof body.name !== "string" || checkNickname(body.name).error) {
          throw new APIError("BAD_REQUEST", {
            message: "Invalid nickname",
            code: "INVALID_NICKNAME",
          });
        }
      }

      const field = NEW_PASSWORD_FIELDS[ctx.path];
      if (field) {
        const password = (ctx.body as Record<string, unknown> | undefined)?.[field];
        if (typeof password !== "string") return;
        const problem = checkPasswordLocally(password);
        if (problem === "common") {
          throw new APIError("BAD_REQUEST", {
            message: "Password is too common",
            code: "PASSWORD_COMMON",
          });
        }
        if (!problem && env.PASSWORD_BREACH_CHECK && (await isPasswordBreached(password))) {
          throw new APIError("BAD_REQUEST", {
            message: "Password found in breaches",
            code: "PASSWORD_BREACHED",
          });
        }
      }
    }),

    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-in/email" || ctx.path === "/sign-up/email") {
        runInBackground(maybePurgeExpiredData());
      }
      const returned = ctx.context.returned;
      if (returned instanceof Error) return;
      const userId = ctx.context.session?.user.id;
      if (!userId) return;
      if (ctx.path === "/change-password") {
        await recordSecurityEvent(userId, "PASSWORD_CHANGED");
        runInBackground(
          sendEmail(
            passwordChangedMessage(
              ctx.context.session!.user.email,
              `${env.APP_URL}/recuperar-senha`,
            ),
            "password-changed",
          ),
        );
      }
      if (ctx.path === "/revoke-sessions" || ctx.path === "/revoke-other-sessions") {
        await recordSecurityEvent(userId, "SESSIONS_REVOKED");
      }
    }),
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({
          data: {
            ...user,
            name: checkNickname(user.name).nickname,
            image: null,
            termsAcceptedAt: new Date(),
          },
        }),
        after: async (user) => {
          await recordSecurityEvent(user.id, "SIGNUP");
        },
      },
      update: {
        // O hook de /update-user valida o apelido; aqui ele é gravado já normalizado.
        before: async (user) => ({
          data:
            user.name === undefined ? user : { ...user, name: checkNickname(user.name).nickname },
        }),
      },
    },
    session: {
      create: {
        // Sem IP e sem User-Agent completo: só um rótulo para a lista de aparelhos.
        before: async (session) => ({
          data: { ...session, ipAddress: null, userAgent: deviceLabel(session.userAgent) },
        }),
        after: async (session) => {
          await recordSecurityEvent(session.userId, "LOGIN");
        },
      },
    },
  },

  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
