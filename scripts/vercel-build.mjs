/**
 * Build na Vercel. As migrações só rodam no deploy de produção, com a conexão
 * direta (DIRECT_URL, ou a DATABASE_URL_UNPOOLED criada pela integração do Neon). Previews usam uma branch do Neon criada pela integração
 * Neon ↔ Vercel e recebem as migrações pelo mesmo comando (VERCEL_ENV=preview).
 */
import { execSync } from "node:child_process";

const run = (command) => execSync(command, { stdio: "inherit" });

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
