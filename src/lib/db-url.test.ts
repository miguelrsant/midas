import { describe, expect, it } from "vitest";

import { withVerifiedTls } from "./db-url";

describe("withVerifiedTls", () => {
  it.each(["prefer", "require", "verify-ca"])("troca sslmode=%s por verify-full", (mode) => {
    const url = withVerifiedTls(
      `postgresql://u:p@ep-x-pooler.sa-east-1.aws.neon.tech/midas?sslmode=${mode}&channel_binding=require`,
    );
    expect(new URL(url).searchParams.get("sslmode")).toBe("verify-full");
    expect(new URL(url).searchParams.get("channel_binding")).toBe("require");
  });

  it("mantém verify-full e conexões sem sslmode (Docker local)", () => {
    const strict = "postgresql://u:p@host/midas?sslmode=verify-full";
    expect(withVerifiedTls(strict)).toBe(strict);
    const local = "postgresql://midas:midas@localhost:5432/midas";
    expect(withVerifiedTls(local)).toBe(local);
  });

  it("preserva usuário e senha com caracteres especiais", () => {
    const url = withVerifiedTls("postgresql://user:p%40ss%23word@host/db?sslmode=require");
    expect(url).toBe("postgresql://user:p%40ss%23word@host/db?sslmode=verify-full");
  });
});
