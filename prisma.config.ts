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
    // Migrações usam a conexão direta (sem pooler). Sem DIRECT_URL, cai na DATABASE_URL.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
