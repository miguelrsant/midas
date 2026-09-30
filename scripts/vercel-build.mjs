/**
 * Build na Vercel.
 * 1. Gera o Prisma Client sempre: a Vercel reaproveita o cache das dependências e,
 *    nesse caso, o `postinstall` não roda, e src/generated/ (fora do git) não existiria.
 * 2. Aplica as migrações em produção e nos previews, com a conexão direta
 *    (DIRECT_URL, ou a DATABASE_URL_UNPOOLED criada pela integração Neon ↔ Vercel).
 *    Cada preview usa uma branch própria do Neon.
 * 3. Faz o build do Next.
 */
import { execSync } from "node:child_process";

const run = (command) => execSync(command, { stdio: "inherit" });

run("pnpm prisma generate");

if (process.env.VERCEL_ENV === "production" || process.env.VERCEL_ENV === "preview") {
  if (!process.env.DIRECT_URL && !process.env.DATABASE_URL_UNPOOLED) {
    console.error(
      "DIRECT_URL (ou DATABASE_URL_UNPOOLED) não definida: as migrações precisam da conexão direta, sem pooler.",
    );
    process.exit(1);
  }
  run("pnpm prisma migrate deploy");
}

run("pnpm next build");
