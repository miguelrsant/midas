import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // O eslint-config-next já registra o plugin jsx-a11y; aqui ligamos o conjunto recomendado inteiro.
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
      "no-console": "error",
    },
  },
  {
    // O logger é o único lugar que escreve no console.
    files: ["src/lib/log.ts", "scripts/**", "e2e/**"],
    rules: { "no-console": "off" },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/generated/**",
    "coverage/**",
    "playwright-report/**",
  ]),
]);
