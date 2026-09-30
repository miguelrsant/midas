import type { Metadata } from "next";
import type { ReactNode } from "react";

import { requireUser } from "@/lib/auth/dal";

import { ChangePasswordForm } from "./change-password-form";
import { NicknameSetting } from "./nickname-setting";
import { ThemeSetting } from "./theme-setting";

export const metadata: Metadata = { title: "Configurações" };

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-lg bg-superficie p-6 shadow-cartao">
      <h2 className="font-display text-heading text-tinta">{title}</h2>
      {children}
    </section>
  );
}

export default async function SettingsPage() {
  const user = await requireUser();
  return (
    <div className="mx-auto flex max-w-120 flex-col gap-6 pt-4">
      <h1 className="font-display text-display-lg text-tinta">Configurações</h1>
      <Section title="Aparência">
        <ThemeSetting />
      </Section>
      <Section title="Conta">
        <NicknameSetting initial={user.name} />
        <p>
          <span className="text-label">E-mail</span>
          <br />
          <span className="break-all">{user.email}</span>
        </p>
      </Section>
      <Section title="Trocar senha">
        <ChangePasswordForm />
      </Section>
    </div>
  );
}
