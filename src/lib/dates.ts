/** Datas no fuso America/Sao_Paulo (docs/design-system/11-conteudo-e-tom.md#datas-e-horas). */

export const TIME_ZONE = "America/Sao_Paulo";

const shortDate = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

/** "30/09/2026" */
export function formatShortDate(date: Date) {
  return shortDate.format(date);
}
