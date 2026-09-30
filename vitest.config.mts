import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    setupFiles: ["./vitest.setup.ts"],
    globalSetup: ["./vitest.global-setup.ts"],
    // Os testes de integração usam o mesmo banco: um arquivo por vez.
    fileParallelism: false,
    coverage: { provider: "v8", include: ["src/lib/**"] },
  },
});
