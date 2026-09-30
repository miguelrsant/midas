import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import type { ReactNode } from "react";

import { Notice } from "@/components/ui/notice";
import { auth } from "@/lib/auth";
import { requireSession } from "@/lib/auth/dal";
import { accountSummary } from "@/lib/data/account";
import { formatShortDate, fromDbDate, MONTH_NAMES } from "@/lib/dates";
import { countOf } from "@/lib/plural";

import { DeleteAccount, ExportData } from "./data-actions";

import { SignOutEverywhere } from "./sign-out-everywhere";

export const metadata: Metadata = { title: "Seus dados" };

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-lg bg-superficie p-6 shadow-cartao">
      <h2 className="font-display text-heading text-tinta">{title}</h2>
      {children}
    </section>
  );
}

/** Direitos do titular (LGPD, art. 18) na própria interface. docs/design-system/16-privacidade-na-interface.md */
export default async function YourDataPage() {
  const { user, session } = await requireSession();
  const sessions = await auth.api.listSessions({ headers: await headers() });
  const summary = await accountSummary(user.id);
  const since = summary.firstEntry
    ? (() => {
        const d = fromDbDate(summary.firstEntry);
        return ` desde ${MONTH_NAMES[Number(d.slice(5, 7)) - 1]} de ${d.slice(0, 4)}`;
      })()
    : "";
  const entriesText = countOf(summary.entries, "lançamento", "lançamentos");

  return (
    <div className="mx-auto flex max-w-120 flex-col gap-6 pt-4">
      <h1 className="font-display text-display-lg text-tinta">Seus dados</h1>
      <Notice tone="privacidade" role="note">
        <strong>Seus dados são só seus.</strong> O Midas não pede CPF nem acessa seu banco. Você
        pode baixar ou apagar tudo quando quiser.
      </Notice>

      <Section title="O que o Midas guarda">
        <ul className="flex list-disc flex-col gap-2 pl-6">
          <li>
            Seu e-mail (<span className="break-all">{user.email}</span>), para entrar e recuperar a
            senha.
          </li>
          <li>Um resumo criptográfico da sua senha. A senha em si nunca fica guardada.</li>
          <li>
            {user.name ? `Seu apelido ("${user.name}"), para a saudação.` : "Nenhum apelido."}
          </li>
          <li>
            Os aparelhos conectados: o navegador e a data do último uso. Sem localização e sem IP.
          </li>
          <li>Conta criada em {formatShortDate(user.createdAt)}.</li>
          <li>
            {entriesText}
            {since}: valor, tipo, categoria, data e descrição (a descrição fica cifrada).
          </li>
          <li>
            {countOf(summary.recurrings, "fixo", "fixos")},{" "}
            {countOf(summary.limits, "limite", "limites")} e{" "}
            {countOf(summary.categories, "categoria própria", "categorias próprias")}.
          </li>
          <li>
            {countOf(summary.calculations, "conta de calculadora", "contas de calculadora")} que
            você adicionou ao planejamento e{" "}
            {countOf(summary.expected, "renda prevista", "rendas previstas")}.
          </li>
          <li>O tema e &ldquo;Ocultar valores&rdquo; ficam só neste aparelho.</li>
        </ul>
        <p className="text-caption text-tinta-suave">
          Todo lançamento se corrige tocando nele. O apelido e as categorias se corrigem em{" "}
          <Link href="/configuracoes" className="md-link">
            Configurações
          </Link>
          .
        </p>
      </Section>

      <Section title="Baixar meus dados">
        <p>
          Um arquivo com tudo (JSON) e uma planilha dos lançamentos (CSV, abre no Excel e no
          LibreOffice). Gerado agora, só para você; nada fica guardado.
        </p>
        <ExportData />
      </Section>

      <Section title="Aparelhos conectados">
        <ul className="flex flex-col divide-y divide-veio">
          {sessions.map((item) => (
            <li key={item.id} className="flex flex-col py-3">
              <span className="font-semibold">
                {item.userAgent || "Aparelho desconhecido"}
                {item.id === session.id ? " (este aparelho)" : ""}
              </span>
              <span className="text-caption text-tinta-suave">
                Último uso em {formatShortDate(item.updatedAt)}
              </span>
            </li>
          ))}
        </ul>
        <SignOutEverywhere />
      </Section>

      <Section title="Quem cuida dos seus dados">
        <p>
          Leia a{" "}
          <Link href="/privacidade" className="md-link">
            Política de privacidade
          </Link>{" "}
          para saber como tratamos seus dados, quais serviços ajudam o Midas a funcionar e como
          falar com a pessoa encarregada.
        </p>
      </Section>

      <Section title="Apagar minha conta">
        <p>
          Apaga a conta e todos os dados, na hora. As cópias de segurança do banco somem em até 7
          dias.
        </p>
        <DeleteAccount entries={entriesText} />
      </Section>
    </div>
  );
}
