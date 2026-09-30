import { Info } from "lucide-react";
import type { ReactNode } from "react";

import { Notice } from "@/components/ui/notice";
import type { LaborResult } from "@/lib/labor/types";
import { formatMoney } from "@/lib/money";

/** Resultado de uma calculadora (docs/design-system/17-padroes-de-tela.md#resultado). */
export function ResultView({
  result,
  title,
  headlineLabel = "Você deve receber cerca de",
}: {
  result: LaborResult;
  title: ReactNode;
  headlineLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-display text-display-lg text-tinta">{title}</h2>
      <div className="flex flex-col gap-1">
        <p className="md-eyebrow">{headlineLabel}</p>
        <p className="font-classica text-display-xl font-bold text-tinta tabular-nums">
          <span className="md-valor">{formatMoney(result.headlineCents)}</span>
          <span className="md-oculto">R$ •••••</span>
        </p>
        <p className="text-body text-tinta-suave">{result.headlineNote}</p>
      </div>
      {result.sections.map((section) => (
        <section
          key={section.title}
          className="rounded-lg bg-superficie p-4 shadow-cartao"
          aria-label={section.title}
        >
          <h3 className="px-2 pb-2 text-title text-tinta">{section.title}</h3>
          <table className="w-full text-left">
            <caption className="md-sr">{section.title}</caption>
            <tbody>
              {section.lines.map((line) => (
                <tr
                  key={line.label}
                  className={line.sign === "=" ? "border-t border-veio font-semibold" : ""}
                >
                  <th scope="row" className="px-2 py-2 align-top text-body font-normal text-tinta">
                    {line.label}
                    {line.note ? (
                      <span className="block text-caption text-tinta-suave">{line.note}</span>
                    ) : null}
                  </th>
                  <td className="px-2 py-2 text-right align-top font-mono text-amount whitespace-nowrap tabular-nums">
                    <span className="md-valor">
                      {line.sign === "+" ? (
                        <span className="text-renda">
                          <span aria-hidden="true">+&nbsp;</span>
                          {formatMoney(line.cents)}
                        </span>
                      ) : line.sign === "-" ? (
                        <span className="text-gasto">
                          <span className="md-sr">menos </span>
                          <span aria-hidden="true">−&nbsp;</span>
                          {formatMoney(line.cents)}
                        </span>
                      ) : (
                        formatMoney(line.cents)
                      )}
                    </span>
                    <span className="md-oculto">R$ •••••</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
      {result.notes.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {result.notes.map((note) => (
            <li key={note} className="flex gap-2 text-caption text-tinta-suave">
              <Info aria-hidden="true" className="mt-0.5 size-4 flex-none" strokeWidth={1.75} />
              {note}
            </li>
          ))}
        </ul>
      ) : null}
      <Notice tone="info" role="note">
        <strong>É uma estimativa.</strong> Confira os valores com o RH ou o sindicato. Tabelas de
        INSS e IR de {result.tableYear}.
        {result.outdated
          ? ` Usamos as tabelas de ${result.tableYear}, as mais recentes que o Midas conhece.`
          : null}
      </Notice>
    </div>
  );
}
