import type { EmailMessage } from "./sender";

/**
 * Textos dos e-mails do Midas.
 * Regras: português simples, curtos, sem nenhum dado financeiro, sem propaganda
 * e sem rastreadores (docs/design-system/16-privacidade-na-interface.md).
 */

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

type Block = { kind: "p"; text: string } | { kind: "button"; text: string; url: string };

function render(to: string, subject: string, title: string, blocks: Block[]): EmailMessage {
  const footer =
    "Você recebeu este e-mail porque ele foi usado no Midas. Não mandamos propaganda. " +
    "Se não foi você, pode ignorar esta mensagem.";

  const text = [
    title,
    "",
    ...blocks.map((block) => (block.kind === "p" ? block.text : `${block.text}: ${block.url}`)),
    "",
    "—",
    footer,
  ].join("\n");

  const body = blocks
    .map((block) =>
      block.kind === "p"
        ? `<p style="margin:0 0 16px;font-size:17px;line-height:26px;color:#2b1f16">${escapeHtml(block.text)}</p>`
        : `<p style="margin:24px 0"><a href="${escapeHtml(block.url)}" style="display:inline-block;background:#5b3a24;color:#fbf7f0;padding:14px 24px;border-radius:10px;font-size:17px;font-weight:600;text-decoration:none">${escapeHtml(block.text)}</a></p>
<p style="margin:0 0 16px;font-size:14px;line-height:20px;color:#65564a">Se o botão não abrir, copie este endereço no navegador:</p>
<p style="margin:0 0 16px;font-size:14px;line-height:20px;word-break:break-all;overflow-wrap:anywhere"><a href="${escapeHtml(block.url)}" style="color:#7e5b17;word-break:break-all">${escapeHtml(block.url)}</a></p>`,
    )
    .join("\n");

  const html = `<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:24px;background:#f5f2ec;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:480px;margin:0 auto;background:#fdfbf7;border-radius:16px;padding:32px;overflow-wrap:anywhere;word-break:break-word">
<p style="margin:0 0 24px;font-size:20px;letter-spacing:.04em;color:#5b3a24">MIDAS</p>
<h1 style="margin:0 0 16px;font-size:24px;line-height:30px;font-weight:600;color:#2b1f16">${escapeHtml(title)}</h1>
${body}
<p style="margin:32px 0 0;font-size:14px;line-height:20px;color:#65564a">${escapeHtml(footer)}</p>
</div>
</body>
</html>`;

  return { to, subject, text, html };
}

export function verifyEmailMessage(to: string, url: string) {
  return render(to, "Confirme seu e-mail no Midas", "Falta só confirmar seu e-mail.", [
    { kind: "p", text: "Toque no botão para confirmar sua conta no Midas." },
    { kind: "button", text: "Confirmar meu e-mail", url },
    { kind: "p", text: "O link vale por 24 horas." },
  ]);
}

export function existingAccountMessage(to: string, signInUrl: string, resetUrl: string) {
  return render(to, "Você já tem conta no Midas", "Você já tem conta no Midas.", [
    {
      kind: "p",
      text: "Alguém tentou criar uma conta com este e-mail, mas ele já está cadastrado. Se foi você, é só entrar.",
    },
    { kind: "button", text: "Entrar no Midas", url: signInUrl },
    { kind: "p", text: `Esqueceu a senha? Crie uma nova em ${resetUrl}` },
  ]);
}

export function resetPasswordMessage(to: string, url: string) {
  return render(to, "Crie uma nova senha no Midas", "Vamos criar uma nova senha.", [
    { kind: "p", text: "Recebemos um pedido para trocar a senha da sua conta." },
    { kind: "button", text: "Criar nova senha", url },
    { kind: "p", text: "O link vale por 30 minutos e só funciona uma vez." },
  ]);
}

export function passwordChangedMessage(to: string, resetUrl: string) {
  return render(to, "Sua senha do Midas foi trocada", "Sua senha foi trocada.", [
    {
      kind: "p",
      text: "A senha da sua conta no Midas acabou de ser trocada, e os outros aparelhos foram desconectados.",
    },
    {
      kind: "p",
      text: `Não foi você? Crie uma nova senha agora em ${resetUrl}`,
    },
  ]);
}
