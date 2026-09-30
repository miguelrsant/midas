import type { Metadata } from "next";

import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/dal";
import { longDate, salutation } from "@/lib/greeting";

export const metadata: Metadata = { title: "Início" };

export default async function DashboardPage() {
  const user = await requireUser();
  const now = new Date();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 pt-4 pb-2">
        <p className="md-eyebrow">{longDate(now)}</p>
        <h1 className="font-display text-display-lg text-tinta">
          {salutation(now)}, {user.name}.
        </h1>
        <hr className="md-veio" aria-hidden="true" />
      </div>
      <EmptyState
        title={
          <>
            Tudo pronto para <em className="md-acento">começar</em>.
          </>
        }
        action={
          <p className="text-caption text-tinta-suave">
            Anotar rendas e gastos chega na próxima versão.
          </p>
        }
      >
        Sua conta está pronta e protegida. Logo você vai anotar o que entra e o que sai e ver quanto
        sobra.
      </EmptyState>
    </div>
  );
}
