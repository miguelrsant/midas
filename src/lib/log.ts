/**
 * Logger do Midas.
 *
 * Regra (CLAUDE.md, Segurança e LGPD): logs sem dados pessoais nem financeiros.
 * Por isso o logger só aceita um nome de evento e campos de uma lista fechada,
 * com valores curtos e sem texto livre. E-mail, valores, descrições, IP e tokens
 * nunca entram aqui.
 */

type Level = "debug" | "info" | "warn" | "error";

/** Campos permitidos. Acrescente só o que não identifica ninguém. */
type LogFields = {
  userId?: string;
  route?: string;
  status?: number;
  code?: string;
  durationMs?: number;
  count?: number;
};

const LEVELS: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const minLevel: Level = process.env.NODE_ENV === "production" ? "info" : "debug";

function write(level: Level, event: string, fields?: LogFields) {
  if (LEVELS[level] < LEVELS[minLevel] || process.env.NODE_ENV === "test") return;
  const line = JSON.stringify({ level, event, ...fields, at: new Date().toISOString() });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

/**
 * Resume um erro sem a mensagem, que pode carregar dados (o Prisma, por exemplo,
 * inclui valores na mensagem de violação de unicidade).
 */
export function errorCode(error: unknown): string {
  if (error && typeof error === "object") {
    const maybe = error as { code?: unknown; name?: unknown };
    if (typeof maybe.code === "string") return maybe.code.slice(0, 40);
    if (typeof maybe.name === "string") return maybe.name.slice(0, 40);
  }
  return "unknown";
}

export const log = {
  debug: (event: string, fields?: LogFields) => write("debug", event, fields),
  info: (event: string, fields?: LogFields) => write("info", event, fields),
  warn: (event: string, fields?: LogFields) => write("warn", event, fields),
  error: (event: string, fields?: LogFields) => write("error", event, fields),
};
