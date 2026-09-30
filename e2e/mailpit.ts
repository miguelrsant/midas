/** Leitura da caixa do Mailpit (http://localhost:8025) nos testes. */

const MAILPIT = process.env.MAILPIT_URL ?? "http://localhost:8025";

type MessageSummary = { ID: string; Subject: string; To: Array<{ Address: string }> };

export async function clearMailbox() {
  await fetch(`${MAILPIT}/api/v1/messages`, { method: "DELETE" });
}

/** Espera chegar um e-mail para `to` com o assunto dado e devolve o texto. */
export async function waitForEmail(
  to: string,
  subject: string,
  timeoutMs = 15_000,
): Promise<string> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const response = await fetch(
      `${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:"${to}"`)}`,
    );
    const data = (await response.json()) as { messages: MessageSummary[] };
    const found = data.messages.find((message) => message.Subject === subject);
    if (found) {
      const full = (await (await fetch(`${MAILPIT}/api/v1/message/${found.ID}`)).json()) as {
        Text: string;
      };
      return full.Text;
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`E-mail "${subject}" não chegou`);
}

export function extractLink(text: string, contains: string): string {
  const match = text.match(new RegExp(`https?://\\S*${contains}\\S*`));
  if (!match) throw new Error(`Link com "${contains}" não encontrado`);
  return match[0];
}

export async function countEmails(to: string) {
  const response = await fetch(
    `${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:"${to}"`)}`,
  );
  const data = (await response.json()) as { messages: MessageSummary[] };
  return data.messages.length;
}
