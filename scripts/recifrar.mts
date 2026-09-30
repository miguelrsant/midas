/**
 * Rotação da chave do texto cifrado (.lgpd/encryption.md).
 *
 * 1. Gere uma chave nova (openssl rand -base64 32) e ponha na frente de
 *    DATA_ENCRYPTION_KEYS ("k2:<nova>,k1:<antiga>"), com DATA_ENCRYPTION_KEY_ID=k2.
 * 2. Rode `pnpm db:recifrar`: cada texto cifrado com outra chave é aberto e cifrado
 *    de novo com a atual, em lotes, sem nunca imprimir o conteúdo.
 * 3. Depois da janela do PITR, tire a chave antiga da lista.
 */
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");

const { needsReseal, openText, sealText } = await import("@/lib/crypto/fields");
const { db } = await import("@/lib/db");

const BATCH = 500;

type Column = {
  label: string;
  field: string;
  find: (
    cursor: string | undefined,
  ) => Promise<Array<{ id: string; userId: string; value: string | null }>>;
  save: (id: string, value: string) => Promise<unknown>;
};

const columns: Column[] = [
  {
    label: "lançamentos",
    field: "entry.description",
    find: (cursor) =>
      db.entry
        .findMany({
          where: { description: { not: null } },
          select: { id: true, userId: true, description: true },
          orderBy: { id: "asc" },
          take: BATCH,
          ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        })
        .then((rows) => rows.map((r) => ({ id: r.id, userId: r.userId, value: r.description }))),
    save: (id, value) => db.entry.update({ where: { id }, data: { description: value } }),
  },
  {
    label: "fixos",
    field: "recurring.description",
    find: (cursor) =>
      db.recurring
        .findMany({
          where: { description: { not: null } },
          select: { id: true, userId: true, description: true },
          orderBy: { id: "asc" },
          take: BATCH,
          ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        })
        .then((rows) => rows.map((r) => ({ id: r.id, userId: r.userId, value: r.description }))),
    save: (id, value) => db.recurring.update({ where: { id }, data: { description: value } }),
  },
  {
    label: "categorias",
    field: "user_category.sealed",
    find: (cursor) =>
      db.userCategory
        .findMany({
          where: { sealed: { not: null } },
          select: { id: true, userId: true, sealed: true },
          orderBy: { id: "asc" },
          take: BATCH,
          ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        })
        .then((rows) => rows.map((r) => ({ id: r.id, userId: r.userId, value: r.sealed }))),
    save: (id, value) => db.userCategory.update({ where: { id }, data: { sealed: value } }),
  },
  {
    label: "contas de calculadora",
    field: "calculation.sealed",
    find: (cursor) =>
      db.calculation
        .findMany({
          select: { id: true, userId: true, sealed: true },
          orderBy: { id: "asc" },
          take: BATCH,
          ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        })
        .then((rows) => rows.map((r) => ({ id: r.id, userId: r.userId, value: r.sealed }))),
    save: (id, value) => db.calculation.update({ where: { id }, data: { sealed: value } }),
  },
];

let failed = 0;
for (const column of columns) {
  let cursor: string | undefined;
  let updated = 0;
  for (;;) {
    const rows = await column.find(cursor);
    if (rows.length === 0) break;
    for (const row of rows) {
      if (!row.value || !needsReseal(row.value)) continue;
      const ref = { field: column.field, userId: row.userId, rowId: row.id };
      try {
        await column.save(row.id, sealText(openText(row.value, ref), ref));
        updated++;
      } catch {
        failed++;
      }
    }
    cursor = rows.at(-1)!.id;
  }
  console.log(`${column.label}: ${updated} recifrados`);
}
if (failed > 0)
  console.log(`${failed} não abriram (chave ausente?): confira DATA_ENCRYPTION_KEYS.`);
await db.$disconnect();
process.exit(failed > 0 ? 1 : 0);
