import { describe, expect, it } from "vitest";

import { deviceLabel } from "./device";

describe("deviceLabel", () => {
  it.each([
    [
      "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36",
      "Chrome no Android",
    ],
    [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
      "Safari no iPhone",
    ],
    [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0",
      "Edge no Windows",
    ],
    ["Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0", "Firefox no Linux"],
    [
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
      "Safari no Mac",
    ],
  ])("resume %s", (ua, label) => {
    expect(deviceLabel(ua)).toBe(label);
  });

  it("nunca devolve o User-Agent inteiro", () => {
    expect(deviceLabel("curl/8.0")).toBe("Navegador");
    expect(deviceLabel(null)).toBe("Aparelho desconhecido");
  });

  it("cabe na coluna do banco (60 caracteres)", () => {
    expect(deviceLabel("SamsungBrowser/25.0 Android").length).toBeLessThanOrEqual(60);
  });
});
