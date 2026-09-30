import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

import { findSessionsByEmail, resetRateLimits } from "./db";
import { countEmails, extractLink, waitForEmail } from "./mailpit";

const PASSWORD = "cafe com pao na varanda de manha";
const NEW_PASSWORD = "chuva fina no telhado da cozinha";

function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@exemplo.test`;
}

async function signUp(page: Page, email: string, password = PASSWORD) {
  await page.goto("/criar-conta");
  await page.getByLabel("Nome").fill("Ana");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByLabel(/Li e aceito/).check();
  await page.getByRole("button", { name: "Criar conta" }).click();
}

async function signIn(page: Page, email: string, password: string) {
  await page.goto("/entrar");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
}

async function createVerifiedAccount(page: Page, email: string) {
  await signUp(page, email);
  await expect(page.getByText("Enviamos um link para")).toBeVisible();
  const text = await waitForEmail(email, "Confirme seu e-mail no Midas");
  await page.goto(extractLink(text, "verify-email"));
  await expect(page.getByRole("heading", { name: /Conta confirmada/ })).toBeVisible();
}

test.beforeEach(async () => {
  await resetRateLimits();
});

test("cabeçalhos de segurança", async ({ request }) => {
  const response = await request.get("/entrar");
  const headers = response.headers();
  expect(headers["content-security-policy"]).toMatch(
    /script-src 'self' 'nonce-[^']+' 'strict-dynamic'/,
  );
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["strict-transport-security"]).toContain("max-age=63072000");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["x-powered-by"]).toBeUndefined();
});

test("quem não entrou vai para a entrada, voltando depois para onde estava", async ({ page }) => {
  await page.goto("/configuracoes");
  await expect(page).toHaveURL(/\/entrar\?de=%2Fconfiguracoes/);
});

test("cadastro, confirmação, entrada e saída", async ({ page }) => {
  const email = uniqueEmail("fluxo");
  await createVerifiedAccount(page, email);

  await page.getByRole("link", { name: "Ir para o início" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Ana.");

  await page.getByRole("button", { name: "Sua conta" }).click();
  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL(/\/entrar/);

  await signIn(page, email, PASSWORD);
  await expect(page).toHaveURL("/");

  // Sessões sem IP e só com o rótulo do aparelho.
  const sessions = await findSessionsByEmail(email);
  expect(sessions.length).toBeGreaterThan(0);
  for (const session of sessions) {
    expect(session.ipAddress).toBeNull();
    expect(session.userAgent).toMatch(/^Chrome no \w+$/);
  }
});

test("sem confirmar o e-mail, não entra", async ({ page }) => {
  const email = uniqueEmail("sem-confirmar");
  await signUp(page, email);
  await expect(page.getByText("Enviamos um link para")).toBeVisible();
  await signIn(page, email, PASSWORD);
  await expect(page.getByText("Falta confirmar seu e-mail")).toBeVisible();
  await expect(page).toHaveURL(/\/entrar/);
});

test("cadastro com e-mail que já existe responde igual e avisa a dona do e-mail", async ({
  page,
}) => {
  const email = uniqueEmail("repetido");
  await createVerifiedAccount(page, email);
  await page.context().clearCookies();

  await signUp(page, email, "outra frase qualquer para a senha");
  await expect(page.getByText("Enviamos um link para")).toBeVisible();
  await waitForEmail(email, "Você já tem conta no Midas");
});

test("senha errada e conta inexistente têm a mesma mensagem", async ({ page }) => {
  const email = uniqueEmail("errada");
  await createVerifiedAccount(page, email);
  await page.context().clearCookies();

  await signIn(page, email, "uma senha que nao e a certa");
  await expect(page.getByText("E-mail ou senha incorretos.")).toBeVisible();

  await signIn(page, uniqueEmail("ninguem"), PASSWORD);
  await expect(page.getByText("E-mail ou senha incorretos.")).toBeVisible();
});

test("senha curta e senha comum são recusadas no cadastro", async ({ page }) => {
  await signUp(page, uniqueEmail("curta"), "curta");
  await expect(page.getByText(/pelo menos 8 caracteres\. Faltam 3\./)).toBeVisible();

  await signUp(page, uniqueEmail("comum"), "passwordpassword");
  await expect(page.getByText(/muito usada e fácil de adivinhar/)).toBeVisible();
});

test("recuperação de senha responde igual e derruba as outras sessões", async ({
  page,
  browser,
}) => {
  const email = uniqueEmail("recupera");
  await createVerifiedAccount(page, email);

  // Um segundo aparelho conectado.
  const other = await browser.newContext();
  const otherPage = await other.newPage();
  await signIn(otherPage, email, PASSWORD);
  await expect(otherPage).toHaveURL("/");

  const fresh = await browser.newContext();
  const resetPage = await fresh.newPage();
  await resetPage.goto("/recuperar-senha");
  await resetPage.getByLabel("E-mail").fill(email);
  await resetPage.getByRole("button", { name: "Enviar link" }).click();
  await expect(resetPage.getByText("Se esse e-mail tiver conta no Midas")).toBeVisible();

  // Mesma resposta para quem não tem conta, e nenhum e-mail enviado.
  const nobody = uniqueEmail("ninguem");
  await resetPage.goto("/recuperar-senha");
  await resetPage.getByLabel("E-mail").fill(nobody);
  await resetPage.getByRole("button", { name: "Enviar link" }).click();
  await expect(resetPage.getByText("Se esse e-mail tiver conta no Midas")).toBeVisible();

  const text = await waitForEmail(email, "Crie uma nova senha no Midas");
  await resetPage.goto(extractLink(text, "reset-password"));
  await resetPage.getByLabel("Senha nova").fill(NEW_PASSWORD);
  await resetPage.getByRole("button", { name: "Salvar senha nova" }).click();
  await expect(resetPage).toHaveURL(/\/entrar\?senha=trocada/);
  await waitForEmail(email, "Sua senha do Midas foi trocada");
  expect(await countEmails(nobody)).toBe(0);

  // O outro aparelho perdeu a sessão.
  await otherPage.goto("/configuracoes");
  await expect(otherPage).toHaveURL(/\/entrar/);

  // O link não vale duas vezes.
  await resetPage.goto(extractLink(text, "reset-password"));
  await expect(resetPage.getByText("Esse link venceu.")).toBeVisible();

  await signIn(resetPage, email, NEW_PASSWORD);
  await expect(resetPage).toHaveURL("/");
  await other.close();
  await fresh.close();
});

test("muitas tentativas de entrada são bloqueadas", async ({ page }) => {
  const email = uniqueEmail("bloqueio");
  for (let attempt = 0; attempt < 5; attempt++) {
    await signIn(page, email, "tentativa errada numero " + attempt);
    await expect(page.getByText("E-mail ou senha incorretos.")).toBeVisible();
  }
  await signIn(page, email, "mais uma tentativa errada");
  await expect(page.getByText("Muitas tentativas. Espere 15 minutos")).toBeVisible();
});

for (const path of ["/entrar", "/criar-conta", "/recuperar-senha", "/privacidade"]) {
  test(`acessibilidade (axe) em ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test.describe("telas de entrada", () => {
  test.use({ colorScheme: "dark" });

  test("ficam no tema claro mesmo com o aparelho no escuro", async ({ page }) => {
    await page.goto("/criar-conta");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });

  test("o cadastro pede nome, e-mail e senha, nessa ordem", async ({ page }) => {
    await page.goto("/criar-conta");
    const labels = await page
      .locator("form label[for]")
      .evaluateAll((els) => els.map((el) => el.getAttribute("for")));
    expect(labels.slice(0, 3)).toEqual(["apelido", "email", "senha"]);
  });

  for (const [width, height] of [
    [390, 844],
    [768, 1024],
    [1366, 768],
    [1920, 1080],
  ] as const) {
    test(`cabem sem rolagem em ${width}x${height}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      for (const path of ["/criar-conta", "/entrar", "/recuperar-senha"]) {
        await page.goto(path);
        const size = await page.evaluate(() => ({
          height: document.documentElement.scrollHeight,
          width: document.documentElement.scrollWidth,
        }));
        expect(size.height, path).toBeLessThanOrEqual(height);
        expect(size.width, path).toBeLessThanOrEqual(width);
      }
    });
  }

  test("não rolam para o lado nem em 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    for (const path of ["/criar-conta", "/entrar", "/recuperar-senha"]) {
      await page.goto(path);
      const width = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(width, path).toBeLessThanOrEqual(320);
    }
  });
});

test.describe("app no celular", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("tem navegação inferior com ícone e texto e menu da conta", async ({ page }) => {
    const email = uniqueEmail("celular");
    await createVerifiedAccount(page, email);
    await page.goto("/");

    const nav = page.getByRole("navigation", { name: "Principal" });
    await expect(nav).toBeVisible();
    for (const label of ["Início", "Lançamentos", "Planejamento", "Calculadoras"]) {
      await expect(nav.getByRole("link", { name: label })).toBeVisible();
    }
    await expect(nav.getByRole("link", { name: "Início" })).toHaveAttribute("aria-current", "page");

    await nav.getByRole("link", { name: "Lançamentos" }).click();
    await expect(page).toHaveURL("/lancamentos");
    await expect(nav.getByRole("link", { name: "Lançamentos" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    const account = page.getByRole("button", { name: "Sua conta" });
    await account.click();
    await expect(account).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(account).toHaveAttribute("aria-expanded", "false");
    await expect(account).toBeFocused();

    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 700 });
      for (const path of ["/", "/lancamentos", "/configuracoes", "/seus-dados"]) {
        await page.goto(path);
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        expect(scrollWidth, `${path} em ${width}px`).toBeLessThanOrEqual(width);
      }
    }
  });
});
