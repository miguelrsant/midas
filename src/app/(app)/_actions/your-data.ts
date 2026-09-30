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
import { reset } from "@/lib/throttle";

/**
 * "Seus dados" (.lgpd/dsar/workflow.md): baixar tudo e apagar a conta, sempre com a
 * senha de novo. O arquivo é gerado na hora e não fica guardado em lugar nenhum.
 */

const passwordSchema = z
  .object({ password: z.string().min(1, "Digite sua senha.").max(512) })
  .strict();

function reauthFailure(result: "wrong" | "limited") {
  return result === "limited" ? fail("too_many") : fail("wrong_password");
}

export async function exportDataAction(
  raw: unknown,
): Promise<ActionResult<{ fileBase: string; json: string; csv: string }>> {
  return authedAction(
    "your_data.export",
    async (user) => {
      const parsed = passwordSchema.safeParse(raw);
      if (!parsed.success) return fail("wrong_password", "Digite sua senha.");
      const check = await verifyCurrentPassword(user.id, parsed.data.password);
      if (check !== "ok") return reauthFailure(check);
      const file = await buildExport(user.id);
      await recordSecurityEvent(user.id, "DATA_EXPORTED");
      return ok({ fileBase: file.fileBase, json: file.json, csv: file.csv });
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
