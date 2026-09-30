import { loadEnvConfig } from "@next/env";
import { defineConfig, devices } from "@playwright/test";

// Os testes rodam contra o Docker local (Postgres + Mailpit), com os valores do .env.development.
const { combinedEnv } = loadEnvConfig(process.cwd(), true);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: "http://localhost:3000",
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // Usa o build de produção (rode `pnpm build` antes).
    command: "pnpm start",
    url: "http://localhost:3000/entrar",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { ...(combinedEnv as Record<string, string>) },
  },
});
