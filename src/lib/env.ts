import "server-only";

import { z } from "zod";

/**
 * Variáveis de ambiente validadas na subida do servidor.
 * Nunca imprima valores: as mensagens de erro citam só o nome da variável.
 * A lista completa, comentada, está em .env.example.
 */

/** Produção de verdade (o deploy de produção na Vercel): aqui as regras ficam mais rígidas. */
const isProduction = process.env.VERCEL_ENV === "production";

const booleanFromString = z.enum(["true", "false"]).transform((value) => value === "true");

const schema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    VERCEL_ENV: z.enum(["development", "preview", "production"]).optional(),
    VERCEL_BRANCH_URL: z.string().optional(),
    VERCEL_URL: z.string().optional(),

    DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),

    // Endereço público do app, sem barra no fim. Em previews da Vercel pode ficar vazio.
    BETTER_AUTH_URL: z.url({ protocol: /^https?$/ }).optional(),
    BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET precisa de 32 caracteres ou mais"),

    SMTP_HOST: z.string().min(1),
    SMTP_PORT: z.coerce.number().int().positive(),
    SMTP_SECURE: booleanFromString.default(true),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    EMAIL_FROM: z.string().min(3),

    // Consulta de senhas vazadas (Have I Been Pwned, k-anonimato).
    PASSWORD_BREACH_CHECK: booleanFromString.default(true),
  })
  .superRefine((env, ctx) => {
    if (!isProduction) return;
    const required = ["BETTER_AUTH_URL", "SMTP_USER", "SMTP_PASSWORD"] as const;
    for (const key of required) {
      if (!env[key])
        ctx.addIssue({ code: "custom", path: [key], message: "obrigatória em produção" });
    }
    if (!env.SMTP_SECURE) {
      ctx.addIssue({ code: "custom", path: ["SMTP_SECURE"], message: "use TLS em produção" });
    }
  });

function loadEnv() {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const problems = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Variáveis de ambiente inválidas:\n${problems}\nVeja .env.example.`);
  }
  const env = parsed.data;

  const appUrl =
    env.BETTER_AUTH_URL ??
    (env.VERCEL_ENV === "preview" && (env.VERCEL_BRANCH_URL ?? env.VERCEL_URL)
      ? `https://${env.VERCEL_BRANCH_URL ?? env.VERCEL_URL}`
      : "http://localhost:3000");

  const APP_URL = appUrl.replace(/\/$/, "");
  if (isProduction && !APP_URL.startsWith("https://")) {
    throw new Error("Variáveis de ambiente inválidas:\n  - BETTER_AUTH_URL: use https em produção");
  }
  const smtpIsLocal = ["localhost", "127.0.0.1", "::1"].includes(env.SMTP_HOST);

  return {
    ...env,
    APP_URL,
    IS_PRODUCTION: isProduction,
    /** Cookies com Secure sempre que o app roda em https (previews e produção). */
    SECURE_COOKIES: APP_URL.startsWith("https://"),
    SMTP_IS_LOCAL: smtpIsLocal,
  };
}

export type Env = ReturnType<typeof loadEnv>;

export const env: Env = loadEnv();
