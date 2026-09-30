import { execSync } from "node:child_process";

import nextEnv from "@next/env";

/** Aplica as migrações no banco de teste (midas_test, do Docker) antes dos testes. */
export default function setup() {
  Object.assign(process.env, { NODE_ENV: "test" });
  const { combinedEnv } = nextEnv.loadEnvConfig(process.cwd(), false);
  execSync("pnpm prisma migrate deploy", {
    stdio: "ignore",
    env: { ...process.env, ...combinedEnv, NODE_ENV: "test" },
  });
}
