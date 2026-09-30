import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import type { ReactNode } from "react";

import { Notice } from "@/components/ui/notice";
import { auth } from "@/lib/auth";
import { requireSession } from "@/lib/auth/dal";
import { formatShortDate } from "@/lib/dates";

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

  return (
    <div className="mx-auto flex max-w-120 flex-col gap-6 pt-4">
      <h1 className="font-display text-display-lg text-tinta">Seus dados</h1>
      <Notice tone="privacidade" role="note">
        <strong>Seus dados são só seus.</strong> O Midas não pede CPF nem acessa seu banco. Você
        pode ver e corrigir o que guardamos quando quiser.
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
        </ul>
        <p className="text-caption text-tinta-suave">
          O nome pode ser corrigido em{" "}
          <Link href="/configuracoes" className="md-link">
            Configurações
          </Link>
          .
        </p>
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

      <Section title="Com quem compartilhamos">
        <p>
          <strong className="font-semibold">Com ninguém.</strong> Para o app funcionar, usamos
          serviços que operam em nosso nome:
        </p>
        <ul className="flex list-disc flex-col gap-2 pl-6">
          <li>Vercel: hospeda o app (servidores em São Paulo).</li>
          <li>Neon: guarda o banco de dados (servidores em São Paulo).</li>
          <li>Google: envia os e-mails de confirmação e de senha.</li>
        </ul>
      </Section>

      <Section title="Quem cuida dos seus dados">
        <p>
          Leia a{" "}
          <Link href="/privacidade" className="md-link">
            Política de privacidade
          </Link>{" "}
          para saber como tratamos seus dados e como falar com a pessoa encarregada.
        </p>
        <p className="text-caption text-tinta-suave">
          Baixar e apagar todos os seus dados chegam junto com os lançamentos, na próxima versão.
        </p>
      </Section>
    </div>
  );
}
