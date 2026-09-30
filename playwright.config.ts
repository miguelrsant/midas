import { loadEnvConfig } from "@next/env";
import { defineConfig, devices } from "@playwright/test";

// Os testes rodam contra o Docker local (Postgres + Mailpit), com os valores do .env.development.
const { combinedEnv } = loadEnvConfig(process.cwd(), true);

// Porta própria para não esbarrar num `pnpm dev` aberto (E2E_PORT=3100 pnpm test:e2e).
const port = Number(process.env.E2E_PORT ?? 3000);
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL,
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // Usa o build de produção (rode `pnpm build` antes).
    command: `pnpm start -p ${port}`,
    url: `${baseURL}/entrar`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { ...(combinedEnv as Record<string, string>), BETTER_AUTH_URL: baseURL },
  },
});
