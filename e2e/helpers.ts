import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

import { verifyEmail } from "./db";

export const PASSWORD = "cafe com pao na varanda de manha";
export const BASE_URL = `http://localhost:${process.env.E2E_PORT ?? 3000}`;

export function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@exemplo.test`;
}

/** Conta confirmada e sessão aberta, sem passar pelo e-mail (já testado em auth.spec.ts). */
export async function signedInAccount(page: Page, prefix: string) {
  const email = uniqueEmail(prefix);
  const response = await page.request.post("/api/auth/sign-up/email", {
    data: { name: "Ana", email, password: PASSWORD, termsVersion: "2026-09-30" },
    headers: { Origin: BASE_URL },
  });
  expect(response.ok()).toBe(true);
  await verifyEmail(email);
  await page.goto("/entrar");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL("/");
  return email;
}

/** Guarda de CSP: registra qualquer violação na página. */
export async function watchCsp(page: Page) {
  const violations: string[] = [];
  page.on("console", (message) => {
    if (message.text().startsWith("Content Security Policy:"))
      violations.push(`${page.url()} ${message.text()}`);
  });
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (event) => {
      console.error(
        `Content Security Policy: ${event.violatedDirective} ${event.blockedURI} ${event.sourceFile}:${event.lineNumber} ${event.sample}`,
      );
    });
  });
  return violations;
}

export async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(
    results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`),
  ).toEqual([]);
}
