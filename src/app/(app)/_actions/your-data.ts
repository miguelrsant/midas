"use server";

import { cookies } from "next/headers";
import { after } from "next/server";
import { z } from "zod";

import { authedAction } from "@/lib/actions/server";
import { type ActionResult, fail, ok } from "@/lib/actions/result";
import { verifyCurrentPassword } from "@/lib/auth/reauth";
import { recordSecurityEvent } from "@/lib/auth/security-events";
import { buildExport, deleteAccountData } from "@/lib/data/account";
import { sendEmail } from "@/lib/email/sender";
import { accountDeletedMessage } from "@/lib/email/templates";
import { consume, reset } from "@/lib/throttle";

/**
 * "Seus dados" (.lgpd/dsar/workflow.md): baixar tudo e apagar a conta, sempre com a
 * senha de novo. O arquivo é gerado na hora e não fica guardado em lugar nenhum.
 */

const passwordSchema = z
  .object({ password: z.string().min(1, "Digite sua senha.").max(512) })
  .strict();
const exportSchema = passwordSchema.extend({ format: z.enum(["json", "csv"]) }).strict();

/**
 * Downloads por hora, contados mesmo com a senha certa: cada um custa um Argon2 e um
 * arquivo inteiro. JSON e CSV vêm em chamadas separadas, para cada resposta ficar
 * menor (a Vercel limita a resposta de uma função a 4,5 MB).
 */
const EXPORTS_PER_HOUR = { windowMs: 60 * 60 * 1000, max: 10 };

function reauthFailure(result: "wrong" | "limited") {
  return result === "limited" ? fail("too_many") : fail("wrong_password");
}

export async function exportDataAction(
  raw: unknown,
): Promise<ActionResult<{ fileName: string; content: string }>> {
  return authedAction(
    "your_data.export",
    async (user) => {
      const parsed = exportSchema.safeParse(raw);
      if (!parsed.success) return fail("wrong_password", "Digite sua senha.");
      if (!(await consume(`export:${user.id}`, EXPORTS_PER_HOUR))) return fail("too_many");
      const check = await verifyCurrentPassword(user.id, parsed.data.password);
      if (check !== "ok") return reauthFailure(check);
      const file = await buildExport(user.id);
      if (parsed.data.format === "json") await recordSecurityEvent(user.id, "DATA_EXPORTED");
      return ok({
        fileName: `${file.fileBase}.${parsed.data.format}`,
        content: parsed.data.format === "json" ? file.json : file.csv,
      });
    },
    { write: false },
  );
}

const SESSION_COOKIES = ["session_token", "session_data", "dont_remember"];

export async function deleteAccountAction(raw: unknown): Promise<ActionResult<null>> {
  return authedAction(
    "your_data.delete",
    async (user) => {
      const parsed = passwordSchema.safeParse(raw);
      if (!parsed.success) return fail("wrong_password", "Digite sua senha.");
      const check = await verifyCurrentPassword(user.id, parsed.data.password);
      if (check !== "ok") return reauthFailure(check);

      // O endereço fica só na memória desta requisição, para o e-mail de confirmação.
      const email = user.email;
      await deleteAccountData(user.id);
      await reset(`pwcheck:${user.id}`);
      await reset(`export:${user.id}`);

      const jar = await cookies();
      for (const prefix of ["midas.", "__Secure-midas."]) {
        for (const name of SESSION_COOKIES) jar.delete(`${prefix}${name}`);
        jar.delete({ name: `${prefix}device`, path: "/api/auth" });
      }
      // Depois da exclusão confirmada; se o envio falhar, a conta já foi apagada.
      after(() => sendEmail(accountDeletedMessage(email), "account_deleted"));
      return ok(null);
    },
    { write: false },
  );
}
