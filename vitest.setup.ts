import { loadEnvConfig } from "@next/env";
import { vi } from "vitest";

// Carrega .env.test (e .env.test.local), como o Next.js faz.
loadEnvConfig(process.cwd());

// "server-only" quebra fora do Next; nos testes, é um módulo vazio.
vi.mock("server-only", () => ({}));
