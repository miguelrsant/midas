import { describe, expect, it } from "vitest";

import { cn } from "./cn";

describe("cn", () => {
  it("mantém tamanho e cor do texto do Midas juntos", () => {
    expect(cn("text-body", "text-tinta")).toBe("text-body text-tinta");
  });

  it("resolve conflitos de tamanho: o último vence", () => {
    expect(cn("text-body", "text-caption")).toBe("text-caption");
  });

  it("ignora valores vazios", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });
});
