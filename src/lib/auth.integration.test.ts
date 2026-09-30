import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  EMAILS_PER_RECIPIENT_PER_HOUR,
  type EmailMessage,
  sendEmail,
  setEmailSender,
} from "@/lib/email/sender";
import { TERMS_VERSION } from "@/lib/legal";
import { purgeExpiredData } from "@/lib/maintenance";

/**
 * Testes de integração da autenticação contra o Postgres de teste (midas_test).
 * Rode `docker compose up -d` antes.
 */

const sent: EmailMessage[] = [];
setEmailSender({ send: async (message) => void sent.push(message) });

const PASSWORD = "cafe com pao na varanda de manha";
const requestHeaders = (ip = "203.0.113.7") =>
  new Headers({
    "user-agent":
      "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36",
    "x-real-ip": ip,
  });

function uniqueEmail() {
  return `teste-${Date.now()}-${Math.floor(Math.random() * 1e6)}@exemplo.test`;
}

async function signUp(email: string, password = PASSWORD) {
  return auth.api.signUpEmail({
    body: { email, password, name: "  Ana  Maria ", termsVersion: TERMS_VERSION },
    headers: requestHeaders(),
  });
}

async function waitFor(check: () => boolean) {
  for (let i = 0; i < 50 && !check(); i++) await new Promise((resolve) => setTimeout(resolve, 20));
}

beforeEach(async () => {
  sent.length = 0;
  await db.rateLimit.deleteMany();
  await db.throttle.deleteMany();
});

afterAll(async () => {
  await db.$disconnect();
});

describe("cadastro", () => {
  it("guarda só o hash Argon2id, a versão dos termos e nenhuma foto", async () => {
    const email = uniqueEmail();
    await signUp(email);
    const user = await db.user.findUniqueOrThrow({ where: { email }, include: { accounts: true } });
    expect(user.emailVerified).toBe(false);
    expect(user.image).toBeNull();
    expect(user.termsVersion).toBe(TERMS_VERSION);
    expect(user.name).toBe("Ana Maria");
    expect(user.termsAcceptedAt).toBeInstanceOf(Date);
    expect(user.accounts[0]?.password).toMatch(/^\$argon2id\$/);
    expect(user.accounts[0]?.password).not.toContain(PASSWORD);
  });

  it("responde igual quando o e-mail já existe, e avisa a dona do e-mail", async () => {
    const email = uniqueEmail();
    const first = await signUp(email);
    const second = await signUp(email, "outra frase para a senha nova");
    expect(Object.keys(second).sort()).toEqual(Object.keys(first).sort());
    expect(Object.keys(second.user).sort()).toEqual(Object.keys(first.user).sort());
    await waitFor(() => sent.some((message) => message.subject === "Você já tem conta no Midas"));
    expect(sent.map((message) => message.subject)).toContain("Você já tem conta no Midas");
    expect(await db.user.count({ where: { email } })).toBe(1);
  });

  it("guarda o token de confirmação só como hash", async () => {
    const email = uniqueEmail();
    await signUp(email);
    await waitFor(() => sent.some((message) => message.to === email));
    const link = sent.find((message) => message.to === email)?.text.match(/token=([\w.-]+)/)?.[1];
    expect(link).toBeTruthy();
    const plain = await db.verification.findFirst({ where: { identifier: link! } });
    expect(plain).toBeNull();
  });

  it("recusa e-mail maior que o banco guarda com 400, não com erro 500", async () => {
    const email = `${"a".repeat(250)}@exemplo.test`;
    await expect(signUp(email)).rejects.toMatchObject({ statusCode: 400 });
    expect(await db.user.count({ where: { email } })).toBe(0);
  });

  it("o link de confirmação confirma, mas não faz entrar", async () => {
    const email = uniqueEmail();
    await signUp(email);
    await waitFor(() => sent.some((message) => message.to === email));
    const token = sent.find((message) => message.to === email)?.text.match(/token=([\w.-]+)/)?.[1];
    expect(token).toBeTruthy();

    await auth.api.verifyEmail({ query: { token: token! }, headers: requestHeaders() });

    const user = await db.user.findUniqueOrThrow({ where: { email }, include: { sessions: true } });
    expect(user.emailVerified).toBe(true);
    expect(user.sessions).toHaveLength(0);
  });

  it("exige o nome", async () => {
    await expect(
      auth.api.signUpEmail({
        body: {
          email: uniqueEmail(),
          password: PASSWORD,
          name: "   ",
          termsVersion: TERMS_VERSION,
        },
        headers: requestHeaders(),
      }),
    ).rejects.toMatchObject({ body: { code: "INVALID_NICKNAME" } });
  });

  it("recusa senha comum e cadastro sem aceite dos termos", async () => {
    await expect(signUp(uniqueEmail(), "passwordpassword")).rejects.toMatchObject({
      body: { code: "PASSWORD_COMMON" },
    });
    await expect(
      auth.api.signUpEmail({
        body: { email: uniqueEmail(), password: PASSWORD, name: "Ana", termsVersion: "antiga" },
        headers: requestHeaders(),
      }),
    ).rejects.toMatchObject({ body: { code: "TERMS_NOT_ACCEPTED" } });
  });
});

describe("sessão", () => {
  it("não guarda IP nem o User-Agent completo, e registra o evento", async () => {
    const email = uniqueEmail();
    await signUp(email);
    await db.user.update({ where: { email }, data: { emailVerified: true } });

    await auth.api.signInEmail({ body: { email, password: PASSWORD }, headers: requestHeaders() });

    const user = await db.user.findUniqueOrThrow({
      where: { email },
      include: { sessions: true, securityEvents: true },
    });
    expect(user.sessions).toHaveLength(1);
    expect(user.sessions[0]?.ipAddress).toBeNull();
    expect(user.sessions[0]?.userAgent).toBe("Chrome no Android");
    expect(user.securityEvents.map((event) => event.type).sort()).toEqual(["LOGIN", "SIGNUP"]);
  });

  it("não deixa entrar sem confirmar o e-mail", async () => {
    const email = uniqueEmail();
    await signUp(email);
    await expect(
      auth.api.signInEmail({ body: { email, password: PASSWORD }, headers: requestHeaders() }),
    ).rejects.toMatchObject({ body: { code: "EMAIL_NOT_VERIFIED" } });
  });
});

describe("limites que não dependem do IP", () => {
  it("barra a 11ª tentativa de entrada no mesmo e-mail, mesmo vinda de IPs diferentes", async () => {
    const email = uniqueEmail();
    await signUp(email);
    await db.user.update({ where: { email }, data: { emailVerified: true } });

    for (let attempt = 0; attempt < 10; attempt++) {
      await expect(
        auth.api.signInEmail({
          body: { email, password: `senha errada numero ${attempt}` },
          headers: requestHeaders(`198.51.100.${attempt + 1}`),
        }),
      ).rejects.toMatchObject({ body: { code: "INVALID_EMAIL_OR_PASSWORD" } });
    }
    // Nem a senha certa passa enquanto a janela não vence.
    await expect(
      auth.api.signInEmail({
        body: { email: email.toUpperCase(), password: PASSWORD },
        headers: requestHeaders("198.51.100.200"),
      }),
    ).rejects.toMatchObject({ statusCode: 429, body: { code: "TOO_MANY_ATTEMPTS" } });
  });

  it("conta do mesmo jeito para e-mail sem conta (não revela quem tem conta)", async () => {
    const email = uniqueEmail();
    for (let attempt = 0; attempt < 10; attempt++) {
      await expect(
        auth.api.signInEmail({
          body: { email, password: PASSWORD },
          headers: requestHeaders(`198.51.100.${attempt + 1}`),
        }),
      ).rejects.toMatchObject({ body: { code: "INVALID_EMAIL_OR_PASSWORD" } });
    }
    await expect(
      auth.api.signInEmail({ body: { email, password: PASSWORD }, headers: requestHeaders() }),
    ).rejects.toMatchObject({ statusCode: 429 });
  });

  it("não manda mais que o limite de e-mails por hora para o mesmo endereço", async () => {
    const to = uniqueEmail();
    const message = { to, subject: "Teste", text: "Teste", html: "<p>Teste</p>" };
    for (let i = 0; i < EMAILS_PER_RECIPIENT_PER_HOUR + 3; i++) await sendEmail(message, "test");
    expect(sent.filter((item) => item.to === to)).toHaveLength(EMAILS_PER_RECIPIENT_PER_HOUR);
    // O limite é por endereço, com maiúsculas ou não.
    await sendEmail({ ...message, to: to.toUpperCase() }, "test");
    expect(sent.filter((item) => item.to.toLowerCase() === to)).toHaveLength(
      EMAILS_PER_RECIPIENT_PER_HOUR,
    );
    // Outro endereço continua recebendo.
    await sendEmail({ ...message, to: uniqueEmail() }, "test");
    expect(sent).toHaveLength(EMAILS_PER_RECIPIENT_PER_HOUR + 1);
    // Os contadores não guardam o e-mail em claro.
    const keys = (await db.throttle.findMany()).map((row) => row.key).join(" ");
    expect(keys).not.toContain(to);
  });
});

describe("apelido", () => {
  it("grava o apelido trocado já normalizado, sem erro com espaços sobrando", async () => {
    const email = uniqueEmail();
    await signUp(email);
    await db.user.update({ where: { email }, data: { emailVerified: true } });
    const { headers } = await auth.api.signInEmail({
      body: { email, password: PASSWORD },
      headers: requestHeaders(),
      returnHeaders: true,
    });
    const cookie = headers
      .getSetCookie()
      .map((value) => value.split(";")[0])
      .join("; ");

    await auth.api.updateUser({
      body: { name: `   Bia   ${" ".repeat(50)}` },
      headers: new Headers({ cookie }),
    });

    expect((await db.user.findUniqueOrThrow({ where: { email } })).name).toBe("Bia");
  });
});

describe("limpeza", () => {
  it("apaga contas não confirmadas com mais de 7 dias e sessões vencidas", async () => {
    const oldEmail = uniqueEmail();
    const newEmail = uniqueEmail();
    await signUp(oldEmail);
    await signUp(newEmail);
    const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
    await db.user.update({ where: { email: oldEmail }, data: { createdAt: eightDaysAgo } });

    const verified = await db.user.findUniqueOrThrow({ where: { email: newEmail } });
    await db.session.create({
      data: {
        id: `s-${Date.now()}`,
        token: `t-${Date.now()}`,
        userId: verified.id,
        expiresAt: new Date(Date.now() - 1000),
      },
    });

    await purgeExpiredData();

    expect(await db.user.findUnique({ where: { email: oldEmail } })).toBeNull();
    expect(await db.user.findUnique({ where: { email: newEmail } })).not.toBeNull();
    expect(await db.session.count({ where: { userId: verified.id } })).toBe(0);
  });
});
