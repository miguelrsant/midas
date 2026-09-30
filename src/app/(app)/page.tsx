import type { Metadata } from "next";

import { Notice } from "@/components/ui/notice";
import { requireUser } from "@/lib/auth/dal";
import { greeting } from "@/lib/dates";

export const metadata: Metadata = { title: "Início" };

export default async function DashboardPage() {
  const user = await requireUser();
  const name = user.name.trim();
  const today = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    weekday: "long",
    day: "numeric",
    month: "long",
  })
    .format(new Date())
    .replace("-feira", "");

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex flex-col gap-2">
        <p className="md-eyebrow">{today}</p>
        <h1 className="font-display text-display-lg text-tinta">
          {greeting()}, {name}. Que bom ter você <em className="md-acento">aqui</em>.
        </h1>
        <hr className="md-veio" />
      </div>
      <Notice role="note">
        O painel com o que entrou, o que saiu e quanto sobrou chega na próxima versão. Sua conta já
        está pronta e protegida.
      </Notice>
    </div>
  );
}
