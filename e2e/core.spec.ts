import { expect, test } from "@playwright/test";

import { countRows, resetRateLimits, userExists } from "./db";
import { expectNoAxeViolations, PASSWORD, signedInAccount, watchCsp } from "./helpers";
import { waitForEmail } from "./mailpit";

/**
 * Fluxos do núcleo do produto: lançamentos, personalização, planejamento, calculadoras
 * e "Seus dados". Cada teste confere também que a CSP não bloqueou nada.
 */

test.beforeEach(async () => {
  await resetRateLimits();
});

test("primeiro acesso: Monte seu mês cria renda e gastos fixos", async ({ page }) => {
  const csp = await watchCsp(page);
  await signedInAccount(page, "comecar");
  await expect(page.getByRole("heading", { name: /Tudo pronto para/ })).toBeVisible();
  await expectNoAxeViolations(page);
  await page.getByRole("link", { name: "Adicionar minha renda" }).click();

  await expect(page.getByRole("heading", { name: "Quanto você recebe por mês?" })).toBeVisible();
  await page.getByLabel(/Renda do mês/).fill("4000");
  await page.getByRole("button", { name: "Continuar" }).click();

  await page.getByLabel("Aluguel").check();
  await page.getByLabel("Internet").check();
  await page.getByRole("button", { name: "Continuar" }).click();

  await page.getByLabel(/^Aluguel/).fill("1650");
  await page.getByLabel(/^Internet/).fill("99,90");
  await page.getByRole("button", { name: "Continuar" }).click();
  // O passo "já foi pago" só aparece se o dia já passou; segue até conferir.
  const confira = page.getByRole("heading", { name: "Confira seu mês" });
  if (!(await confira.isVisible())) await page.getByRole("button", { name: "Continuar" }).click();
  await expect(confira).toBeVisible();
  await page.getByRole("button", { name: "Salvar meu mês" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("status").filter({ hasText: "Seu mês está montado." })).toBeVisible();

  await page.goto("/planejamento/fixos");
  await expect(page.getByText("Aluguel")).toBeVisible();
  await expect(page.getByText("Internet")).toBeVisible();
  await expectNoAxeViolations(page);
  expect(csp).toEqual([]);
});

test("anotar um gasto com atalho, editar e excluir", async ({ page }) => {
  const csp = await watchCsp(page);
  await signedInAccount(page, "gasto");
  await page.goto("/lancamentos");
  await page.getByRole("link", { name: "Adicionar gasto" }).click();
  await expect(page.getByRole("heading", { name: "Adicionar gasto" })).toBeVisible();
  await expect(page.getByLabel(/Quanto foi\?/)).toBeFocused();
  await expectNoAxeViolations(page);

  // Erro só ao salvar.
  await page.getByRole("button", { name: "Salvar gasto" }).click();
  await expect(page.getByText("Digite um valor maior que zero.")).toBeVisible();

  await page.getByLabel(/Quanto foi\?/).fill("8,5");
  await page.getByRole("button", { name: "Café" }).click();
  await expect(page.getByRole("radio", { name: "Restaurante" })).toBeChecked();
  await page.getByRole("button", { name: "Salvar gasto" }).click();

  // Salvou: volta ao Início, com o aviso e a linha nova.
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("status").filter({ hasText: "Anotado: Café" })).toBeVisible();
  const row = page.getByRole("link", { name: /Café/ });
  await expect(row).toContainText("8,50");
  await expectNoAxeViolations(page);

  // Busca na lista de lançamentos, sem resultado.
  await page.goto("/lancamentos");
  await page.getByLabel("Buscar lançamento").fill("farmácia");
  await expect(page.getByText(/Nenhum lançamento com “farmácia”/)).toBeVisible();
  await page.getByRole("button", { name: "Limpar busca" }).click();

  await row.click();
  await expect(page.getByRole("heading", { name: "Editar gasto" })).toBeVisible();
  await page.getByLabel(/Quanto foi\?/).fill("9");
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("status").filter({ hasText: "Alterado: Café" })).toBeVisible();

  await page.getByRole("link", { name: /Café/ }).click();
  await page.getByRole("button", { name: "Excluir lançamento" }).click();
  await expect(page.getByRole("button", { name: "Manter lançamento" })).toBeFocused();
  await page.getByRole("button", { name: "Excluir lançamento" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Lançamento excluído" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Café/ })).toHaveCount(0);
  expect(csp).toEqual([]);
});

test("Voltar sai do formulário aberto direto, e Repete por alguns meses", async ({ page }) => {
  const csp = await watchCsp(page);
  await signedInAccount(page, "voltar");
  // Formulário aberto direto (sem histórico no app): Voltar leva ao Início.
  await page.goto("/lancamentos/novo");
  await page.getByLabel(/Quanto foi\?/).fill("350");
  await page.getByRole("button", { name: "Voltar" }).click();
  await page.getByRole("button", { name: "Sair sem salvar" }).click();
  await expect(page).toHaveURL("/");

  await page.goto("/lancamentos/novo");
  await page.getByLabel(/Quanto foi\?/).fill("250");
  await page.getByLabel("Repete todo mês").check();
  await expect(page.getByRole("radio", { name: "Sem fim" })).toBeChecked();
  await page.getByRole("radio", { name: "Por alguns meses" }).check({ force: true });
  await page.getByLabel("Quantos meses, contando este?").fill("3");
  await expectNoAxeViolations(page);
  await page.getByRole("button", { name: "Salvar gasto" }).click();
  await expect(page).toHaveURL("/");
  await expect(
    page.getByRole("status").filter({ hasText: /Ele se repete todo dia \d+ até / }),
  ).toBeVisible();
  expect(csp).toEqual([]);
});

test("categoria própria com ícone aparece no formulário", async ({ page }) => {
  await signedInAccount(page, "categoria");
  await page.goto("/configuracoes/categorias");
  await expectNoAxeViolations(page);
  await page.getByRole("link", { name: "Criar categoria de gasto" }).click();
  await page.getByLabel("Nome").fill("academia do bairro");
  await page.getByRole("radio", { name: "Haltere" }).check({ force: true });
  await expectNoAxeViolations(page);
  await page.getByRole("button", { name: "Criar categoria" }).click();
  await expect(page.getByRole("link", { name: /Academia do bairro/ })).toBeVisible();

  await page.goto("/lancamentos/novo");
  await page.getByRole("button", { name: /Mais categorias/ }).click();
  await expect(page.getByRole("radio", { name: "Academia do bairro" })).toBeVisible();
});

test("limite a 90% vira aviso no Início", async ({ page }) => {
  await signedInAccount(page, "limite");
  await page.goto("/planejamento/limites/mercado");
  await page.getByLabel(/Quanto você quer gastar com Mercado/).fill("100");
  await page.getByRole("button", { name: "Salvar limite" }).click();
  await expect(page).toHaveURL("/");

  await page.goto("/lancamentos/novo");
  await page.getByLabel(/Quanto foi\?/).fill("95");
  await page.getByRole("radio", { name: "Mercado" }).check({ force: true });
  await page.getByRole("button", { name: "Salvar gasto" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Anotado" })).toBeVisible();
  await page.goto("/");
  await expect(page.getByText("Mercado chegou a 90% do limite.")).toBeVisible();
  await expectNoAxeViolations(page);
});

test("13º no planejamento e Recebi", async ({ page }) => {
  const csp = await watchCsp(page);
  await signedInAccount(page, "decimo");
  await page.goto("/calculadoras");
  await expectNoAxeViolations(page);
  await page.getByRole("link", { name: "Calcular 13º salário" }).click();
  await expect(page.getByText("Passo 1 de 4")).toBeVisible();
  await page.getByLabel(/Salário bruto/).fill("5400");
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByLabel("Data de entrada").fill("2020-01-02");
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByRole("heading", { name: "Confira suas respostas" })).toBeVisible();
  await page.getByRole("button", { name: "Ver o resultado" }).click();
  await expect(page.getByText("É uma estimativa.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "1ª parcela, até 30 de novembro" })).toBeVisible();
  await expectNoAxeViolations(page);
  await page.getByRole("button", { name: "Adicionar ao planejamento" }).click();
  await expect(page).toHaveURL("/");
  await expect(
    page.getByRole("status").filter({ hasText: "13º adicionado ao planejamento" }),
  ).toBeVisible();

  await page.goto("/planejamento");
  await expect(page.getByText("13º salário, 1ª parcela")).toBeVisible();
  await expect(page.getByText("13º salário, 2ª parcela")).toBeVisible();
  await expectNoAxeViolations(page);
  await page.getByRole("button", { name: "Recebi: 13º salário, 1ª parcela", exact: true }).click();
  await page.getByRole("button", { name: "Anotar renda" }).click();
  await expect(page).toHaveURL("/");
  await expect(
    page.getByRole("status").filter({ hasText: "Anotado: 13º salário, 1ª parcela" }),
  ).toBeVisible();
  await page.goto("/planejamento");
  await expect(
    page.getByRole("button", { name: "Recebi: 13º salário, 1ª parcela", exact: true }),
  ).toHaveCount(0);
  expect(csp).toEqual([]);
});

test("rescisão sem justa causa leva ao seguro-desemprego", async ({ page }) => {
  await signedInAccount(page, "rescisao");
  await page.goto("/calculadoras/rescisao");
  await page.getByLabel(/Salário bruto/).fill("3000");
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByLabel("Data de entrada").fill("2023-03-10");
  await page.getByLabel("Último dia de trabalho").fill("2026-09-30");
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("radio", { name: /sem justa causa/ }).check();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("radio", { name: /pagou o aviso em dinheiro/ }).check();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: "Ver o resultado" }).click();
  await expect(page.getByRole("heading", { name: /O que a empresa paga/ })).toBeVisible();
  await expect(page.getByText("Multa de 40%")).toBeVisible();
  await expectNoAxeViolations(page);
  await page.getByRole("link", { name: "Ver o seguro-desemprego" }).click();
  await expect(page.getByRole("radio", { name: /sem justa causa/ })).toBeChecked();
});

test("salário bruto dividido em adiantamento e resto", async ({ page }) => {
  const csp = await watchCsp(page);
  await signedInAccount(page, "salario");
  await page.goto("/planejamento/fixos/novo?tipo=renda");
  await page.getByRole("radio", { name: "Salário" }).check({ force: true });
  // O caso comum já vem marcado; bruto e divisão só aparecem quando escolhidos.
  await expect(page.getByRole("radio", { name: /Líquido/ })).toBeChecked();
  await expect(page.getByLabel("Quanto vem no adiantamento?")).toHaveCount(0);
  await page.getByRole("radio", { name: /Bruto/ }).check({ force: true });
  await page.getByLabel(/Quanto é o salário bruto/).fill("5000");
  await expect(page.getByText(/Cai na conta cerca de R\$\s4\.498,49\./)).toBeVisible();
  await page.getByRole("radio", { name: "Dividido em dois" }).check({ force: true });
  await expect(page.getByLabel("Dia do resto")).toBeVisible();
  await expect(
    page.getByText(/R\$\s1\.799,39 no dia 20 e R\$\s2\.699,10 no dia 5\./),
  ).toBeVisible();
  await expectNoAxeViolations(page);
  await page.getByRole("button", { name: "Salvar renda fixa" }).click();
  await expect(page).toHaveURL("/");
  await expect(
    page.getByRole("status").filter({ hasText: /Salário: R\$\s1\.799,39 no dia 20/ }),
  ).toBeVisible();

  // Abrir o adiantamento abre o salário, com a divisão; parar apaga os dois.
  await page.goto("/planejamento/fixos");
  await page.getByRole("link", { name: /Adiantamento/ }).click();
  await expect(page.getByRole("radio", { name: "Dividido em dois" })).toBeChecked();
  await page.getByRole("button", { name: "Parar este fixo" }).click();
  await expect(page.getByText("Parar o salário e o adiantamento?")).toBeVisible();
  await page.getByRole("button", { name: "Parar este fixo" }).click();
  await expect(page).toHaveURL("/");
  await page.goto("/planejamento/fixos");
  await expect(page.getByRole("link", { name: /Adiantamento/ })).toHaveCount(0);
  expect(csp).toEqual([]);
});

test("baixar os dados e apagar a conta", async ({ page }) => {
  const csp = await watchCsp(page);
  const email = await signedInAccount(page, "dados");
  await page.goto("/lancamentos/novo");
  await page.getByLabel(/Quanto foi\?/).fill("10");
  await page.getByRole("button", { name: "Salvar gasto" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Anotado" })).toBeVisible();

  await page.goto("/seus-dados");
  await expect(page.getByText(/1 lançamento/)).toBeVisible();
  await expectNoAxeViolations(page);
  await page.getByRole("button", { name: "Baixar meus dados" }).click();
  await page.getByLabel("Senha", { exact: true }).fill("senha errada de teste");
  await page.getByRole("button", { name: "Baixar meus dados" }).click();
  await expect(page.getByText("Senha incorreta.")).toBeVisible();
  await page.getByLabel("Senha", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Baixar meus dados" }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("link", { name: "Baixar lançamentos (planilha CSV)" }).click();
  expect((await download).suggestedFilename()).toMatch(/^midas-dados-\d{4}-\d{2}-\d{2}\.csv$/);

  await page.getByRole("button", { name: "Apagar minha conta" }).click();
  await page.getByLabel("Digite sua senha para confirmar").fill(PASSWORD);
  await page.getByRole("button", { name: "Apagar minha conta e meus dados" }).click();
  await expect(page).toHaveURL("/conta-apagada");
  await expect(page.getByRole("heading", { name: "Sua conta foi apagada." })).toBeVisible();
  expect(await userExists(email)).toBe(false);
  expect(await countRows("entry", email)).toBe(0);
  await waitForEmail(email, "Sua conta do Midas foi apagada");
  expect(csp).toEqual([]);
});

test.describe("telas do produto a 320px no tema escuro", () => {
  test.use({ viewport: { width: 320, height: 640 }, colorScheme: "dark" });

  test("sem rolagem para o lado e sem violações do axe", async ({ page }) => {
    await signedInAccount(page, "estreito");
    // Um lançamento, um fixo e um limite, para as telas terem conteúdo.
    await page.goto("/lancamentos/novo");
    await page.getByLabel(/Quanto foi\?/).fill("1.234,56");
    await page.getByRole("button", { name: "Salvar gasto" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Anotado" })).toBeVisible();

    await page.goto("/configuracoes");
    await page.getByRole("radio", { name: "Escuro" }).check({ force: true });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    for (const path of [
      "/",
      "/lancamentos",
      "/lancamentos/novo",
      "/planejamento",
      "/planejamento/fixos/novo",
      "/planejamento/limites",
      "/calculadoras",
      "/calculadoras/rescisao",
      "/configuracoes/categorias",
      "/seus-dados",
    ]) {
      await page.goto(path);
      const width = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(width, path).toBeLessThanOrEqual(320);
      await expectNoAxeViolations(page);
    }
  });
});
