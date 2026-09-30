import { loadEnvConfig } from "@next/env";
import { Client } from "pg";

loadEnvConfig(process.cwd(), true);

async function query(sql: string, params: unknown[] = []) {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    return await client.query(sql, params);
  } finally {
    await client.end();
  }
}

/** Cada teste começa sem contadores de tentativas (todos saem do mesmo IP). */
export async function resetRateLimits() {
  await query('DELETE FROM "rate_limit"');
  await query('DELETE FROM "throttle"');
}

export async function findSessionsByEmail(email: string) {
  const result = await query(
    'SELECT s."ipAddress", s."userAgent" FROM "session" s JOIN "user" u ON u.id = s."userId" WHERE u.email = $1',
    [email],
  );
  return result.rows as Array<{ ipAddress: string | null; userAgent: string | null }>;
}

/** Confirma o e-mail direto no banco (os fluxos do produto não precisam repetir a confirmação). */
export async function verifyEmail(email: string) {
  await query('UPDATE "user" SET "emailVerified" = true WHERE email = $1', [email]);
}

export async function countRows(table: string, email: string) {
  const result = await query(
    `SELECT count(*)::int AS n FROM "${table}" t JOIN "user" u ON u.id = t."userId" WHERE u.email = $1`,
    [email],
  );
  return (result.rows[0] as { n: number }).n;
}

export async function userExists(email: string) {
  const result = await query('SELECT 1 FROM "user" WHERE email = $1', [email]);
  return result.rowCount === 1;
}
