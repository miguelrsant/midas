import "server-only";

import nodemailer from "nodemailer";

import { env } from "@/lib/env";
import { errorCode, log } from "@/lib/log";
import { consume, emailKey } from "@/lib/throttle";

export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

/**
 * Quem envia os e-mails. Hoje é SMTP (Gmail em produção, Mailpit no dev);
 * trocar por um provedor transacional é escrever outra implementação desta interface.
 */
export interface EmailSender {
  send(message: EmailMessage): Promise<void>;
}

class SmtpSender implements EmailSender {
  private transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth:
      env.SMTP_USER && env.SMTP_PASSWORD
        ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD }
        : undefined,
    // Fora da máquina local (Mailpit), TLS com certificado válido é obrigatório.
    requireTLS: !env.SMTP_IS_LOCAL,
    tls: env.SMTP_IS_LOCAL ? undefined : { minVersion: "TLSv1.2", rejectUnauthorized: true },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });

  async send(message: EmailMessage) {
    await this.transport.sendMail({
      from: env.EMAIL_FROM,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
      // Sem rastreamento de abertura: nada de pixel ou link encurtado.
      headers: { "Auto-Submitted": "auto-generated" },
    });
  }
}

let sender: EmailSender = new SmtpSender();

/** Troca o remetente (usado nos testes). */
export function setEmailSender(next: EmailSender) {
  sender = next;
}

const HOUR_MS = 60 * 60 * 1000;
/** E-mails para o mesmo endereço por hora: cobre confirmar, redefinir e o aviso de troca. */
export const EMAILS_PER_RECIPIENT_PER_HOUR = 5;

/**
 * Limites de envio. Sem eles, pedidos de muitos IPs enchem a caixa de alguém ou
 * esgotam a cota diária do remetente, e aí ninguém mais confirma a conta nem
 * recupera a senha. Passou do limite, o e-mail não sai; a resposta da API não muda.
 */
async function withinEmailLimits(to: string) {
  const perRecipient = await consume(emailKey("mail", to), {
    windowMs: HOUR_MS,
    max: EMAILS_PER_RECIPIENT_PER_HOUR,
  });
  if (!perRecipient) return false;
  return consume("mail:global", { windowMs: 24 * HOUR_MS, max: env.EMAIL_DAILY_LIMIT });
}

/**
 * Envia sem derrubar quem chamou. O erro é registrado só com o código,
 * sem o endereço nem o conteúdo (CLAUDE.md: logs sem dados pessoais).
 */
export async function sendEmail(message: EmailMessage, kind: string) {
  try {
    if (!(await withinEmailLimits(message.to))) {
      log.warn("email.throttled", { code: kind });
      return;
    }
    await sender.send(message);
    log.info("email.sent", { code: kind });
  } catch (error) {
    log.error("email.failed", { code: `${kind}:${errorCode(error)}` });
  }
}
