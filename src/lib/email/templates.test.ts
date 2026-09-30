import { describe, expect, it } from "vitest";

import { passwordChangedMessage, resetPasswordMessage, verifyEmailMessage } from "./templates";

const LONG_URL = `http://localhost:3000/api/auth/verify-email?token=${"a".repeat(300)}&callbackURL=%2Fconfirmar-email`;

describe("templates de e-mail", () => {
  it("quebram o link longo em vez de vazar para fora do cartão", () => {
    const { html } = verifyEmailMessage("ana@exemplo.test", LONG_URL);
    expect(html).toContain("word-break:break-all");
    expect(html).toContain(`<a href="${LONG_URL.replaceAll("&", "&amp;")}"`);
  });

  it("escapam o HTML do endereço", () => {
    const { html } = resetPasswordMessage("ana@exemplo.test", 'http://x.test/?a="><script>');
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("não levam dado financeiro nem o e-mail no corpo", () => {
    const { html, text } = passwordChangedMessage(
      "ana@exemplo.test",
      "http://x.test/recuperar-senha",
    );
    expect(text).not.toContain("R$");
    expect(html).not.toContain("ana@exemplo.test");
  });
});
