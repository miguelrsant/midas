/**
 * Limpeza manual dos dados vencidos (o app também roda a mesma limpeza sozinho,
 * depois de entradas e cadastros). Uso: pnpm db:limpeza
 * Em produção: DATABASE_URL=... pnpm db:limpeza (veja .lgpd/retention.md).
 */
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");

const { purgeExpiredData } = await import("@/lib/maintenance");
const { db } = await import("@/lib/db");

const result = await purgeExpiredData();
console.log(
  `Limpeza feita: ${result.sessions} sessões, ${result.verifications} tokens, ` +
    `${result.rateLimits} contadores e ${result.unverifiedUsers} contas não confirmadas apagadas.`,
);
await db.$disconnect();
