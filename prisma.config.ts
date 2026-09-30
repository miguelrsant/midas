import { loadEnvConfig } from "@next/env";
import { defineConfig } from "prisma/config";

// Carrega .env.development / .env.local do mesmo jeito que o Next.js.
loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Migrações usam a conexão direta (sem pooler): DIRECT_URL, ou a DATABASE_URL_UNPOOLED
    // que a integração Neon ↔ Vercel cria sozinha. Sem nenhuma, cai na DATABASE_URL.
    url:
      process.env.DIRECT_URL ?? process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "",
  },
});
