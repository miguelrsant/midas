import "server-only";

import { z } from "zod";

/**
 * Variáveis de ambiente validadas na subida do servidor.
 * Nunca imprima valores: as mensagens de erro citam só o nome da variável.
 * A lista das variáveis está no README (seção "Publicar na Vercel").
 */

/** Produção de verdade (o deploy de produção na Vercel): aqui as regras ficam mais rígidas. */
const isProduction = process.env.VERCEL_ENV === "production";

/** Chaves de exemplo versionadas em .env.development e .env.test: nunca valem em produção. */
const PUBLIC_DATA_KEYS = [
  "ZGV2LW9ubHkta2V5LW5hby11c2UtZW0tcHJvZHVjYW8=",
  "dGVzdC1vbmx5LWtleS1uYW8tdXNlLWVtLXByb2R1Y2E=",
];

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
    // Teto de e-mails por dia, abaixo da cota do remetente (Gmail pessoal: cerca de 500).
    // Protege a confirmação e a recuperação de senha de quem tenta esgotar a cota.
    EMAIL_DAILY_LIMIT: z.coerce.number().int().positive().default(400),

    // Chaves que cifram o texto livre (.lgpd/encryption.md): "k1:<base64 de 32 bytes>[,k0:...]".
    DATA_ENCRYPTION_KEYS: z
      .string()
      .regex(
        /^[a-z0-9]{1,8}:[A-Za-z0-9+/]{43}=(,[a-z0-9]{1,8}:[A-Za-z0-9+/]{43}=)*$/,
        "use kid:base64 de 32 bytes, separados por vírgula",
      ),
    DATA_ENCRYPTION_KEY_ID: z.string().regex(/^[a-z0-9]{1,8}$/),

    // Consulta de senhas vazadas (Have I Been Pwned, k-anonimato).
    PASSWORD_BREACH_CHECK: booleanFromString.default(true),
  })
  .superRefine((env, ctx) => {
    const kids = env.DATA_ENCRYPTION_KEYS.split(",").map((entry) => entry.split(":")[0]);
    if (!kids.includes(env.DATA_ENCRYPTION_KEY_ID)) {
      ctx.addIssue({
        code: "custom",
        path: ["DATA_ENCRYPTION_KEY_ID"],
        message: "não está em DATA_ENCRYPTION_KEYS",
      });
    }
    if (!isProduction) return;
    const required = ["BETTER_AUTH_URL", "SMTP_USER", "SMTP_PASSWORD"] as const;
    for (const key of required) {
      if (!env[key])
        ctx.addIssue({ code: "custom", path: [key], message: "obrigatória em produção" });
    }
    // As chaves de .env.development e .env.test são públicas (estão no repositório).
    if (PUBLIC_DATA_KEYS.some((key) => env.DATA_ENCRYPTION_KEYS.includes(key))) {
      ctx.addIssue({
        code: "custom",
        path: ["DATA_ENCRYPTION_KEYS"],
        message: "use uma chave própria em produção (as de dev e teste são públicas)",
      });
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
    throw new Error(`Variáveis de ambiente inválidas:\n${problems}\nVeja o README.`);
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
