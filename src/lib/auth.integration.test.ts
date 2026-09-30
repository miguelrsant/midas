import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { type EmailMessage, setEmailSender } from "@/lib/email/sender";
import { TERMS_VERSION } from "@/lib/legal";
import { purgeExpiredData } from "@/lib/maintenance";

/**
 * Testes de integração da autenticação contra o Postgres de teste (midas_test).
 * Rode `docker compose up -d` antes.
 */

const sent: EmailMessage[] = [];
setEmailSender({ send: async (message) => void sent.push(message) });

const PASSWORD = "cafe com pao na varanda de manha";
const requestHeaders = () =>
  new Headers({
    "user-agent":
      "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36",
    "x-real-ip": "203.0.113.7",
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
