import { describe, expect, it } from "vitest";

import { buildCsp } from "./proxy";

describe("buildCsp", () => {
  const csp = buildCsp("abc123", { isDev: false, isHttps: true });

  it("só permite o próprio domínio e scripts com nonce", () => {
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self' 'nonce-abc123' 'strict-dynamic'");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).not.toMatch(/https?:\/\//);
  });

  it("bloqueia iframes, plugins e base tag", () => {
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'none'");
    expect(csp).toContain("upgrade-insecure-requests");
  });

  it("libera unsafe-eval só no dev, e não força https no localhost", () => {
    const dev = buildCsp("abc123", { isDev: true, isHttps: false });
    expect(dev).toContain("'unsafe-eval'");
    expect(dev).not.toContain("upgrade-insecure-requests");
  });
});
