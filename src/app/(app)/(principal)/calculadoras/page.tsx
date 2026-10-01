import { Calculator, Coins, FileText, TreePalm, Umbrella, Wallet } from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";

import { Money } from "@/components/midas/money";
import { buttonClasses } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/dal";
import { listCalculations } from "@/lib/data/planning";
import { formatShortDate } from "@/lib/dates";

import { DeleteCalculation } from "./delete-calculation";
import { CALCULATOR_NAMES } from "@/lib/labor/kinds";

export const metadata: Metadata = { title: "Calculadoras" };

const CARDS: Array<{ href: Route; title: string; text: string; Icon: typeof Calculator }> = [
  {
    href: "/calculadoras/ferias",
    title: "Férias",
    text: "Veja quanto você recebe nas férias, com o terço a mais.",
    Icon: TreePalm,
  },
  {
    href: "/calculadoras/decimo-terceiro",
    title: "13º salário",
    text: "Veja o valor das duas parcelas e quando cada uma cai.",
    Icon: Coins,
  },
  {
    href: "/calculadoras/rescisao",
    title: "Rescisão",
    text: "Veja uma estimativa do que você recebe quando o contrato termina.",
    Icon: FileText,
  },
  {
    href: "/calculadoras/salario-liquido",
    title: "Salário líquido",
    text: "Veja quanto do salário bruto cai na sua conta, depois do INSS e do Imposto de Renda.",
    Icon: Wallet,
  },
  {
    href: "/calculadoras/seguro-desemprego",
    title: "Seguro-desemprego",
    text: "Veja quantas parcelas e de quanto, se você foi dispensado ou dispensada sem justa causa.",
    Icon: Umbrella,
  },
];

const KIND_NAMES = CALCULATOR_NAMES;

/** "Quanto vou receber?" (docs/design-system/17-padroes-de-tela.md#calculadoras) */
export default async function CalculatorsPage() {
  const user = await requireUser();
  const calculations = await listCalculations(user.id, { take: 50 });
  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-display-lg text-tinta">Calculadoras</h1>
        <p className="text-tinta-suave">
          Férias, 13º, rescisão, salário líquido e seguro-desemprego viram números que entram no
          planejamento do ano. São estimativas, com as tabelas oficiais de INSS e Imposto de Renda.
        </p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {CARDS.map(({ href, title, text, Icon }) => (
          <li key={href} className="flex flex-col gap-3 rounded-lg bg-superficie p-6 shadow-cartao">
            <Icon aria-hidden="true" className="size-7 text-ouro-texto" strokeWidth={1.75} />
            <h2 className="font-display text-heading text-tinta">{title}</h2>
            <p className="flex-1 text-tinta-suave">{text}</p>
            <Link href={href} className={buttonClasses({ variant: "secondary" })}>
              Calcular<span className="md-sr"> {title}</span>
            </Link>
          </li>
        ))}
      </ul>
      <section aria-labelledby="ultimas" className="rounded-lg bg-superficie p-6 shadow-cartao">
        <h2 id="ultimas" className="mb-3 font-display text-heading text-tinta">
          Suas últimas contas
        </h2>
        {calculations.length === 0 ? (
          <p className="text-tinta-suave">
            As contas que você adicionar ao planejamento aparecem aqui. As que você só consulta não
            ficam guardadas.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-veio">
            {calculations.map((c) => (
              <li key={c.id} className="flex flex-col gap-2 py-3">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-body font-semibold text-tinta">{KIND_NAMES[c.kind]}</span>
                  {c.data ? (
                    <Money
                      cents={c.data.result.headlineCents}
                      approx
                      className="font-mono text-amount"
                    />
                  ) : null}
                </div>
                <span className="text-caption text-tinta-suave">
                  Feita em {formatShortDate(c.createdAt)}
                  {c.data ? ` · ${c.data.result.headlineNote}` : ""}
                </span>
                {c.data ? (
                  <Link
                    href={`/calculadoras/conta/${c.id}` as Route}
                    className={buttonClasses({ variant: "secondary" })}
                  >
                    Ver a conta<span className="md-sr"> de {KIND_NAMES[c.kind]}</span>
                  </Link>
                ) : null}
                <DeleteCalculation
                  id={c.id}
                  label={KIND_NAMES[c.kind].toLocaleLowerCase("pt-BR")}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
