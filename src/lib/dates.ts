/** Datas no fuso America/Sao_Paulo (docs/design-system/11-conteudo-e-tom.md#datas-e-horas). */

export const TIME_ZONE = "America/Sao_Paulo";

const shortDate = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const hourFmt = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TIME_ZONE,
  hour: "numeric",
  hourCycle: "h23",
});

/** "30/09/2026" */
export function formatShortDate(date: Date) {
  return shortDate.format(date);
}

/** "Bom dia", "Boa tarde" ou "Boa noite", pela hora de Brasília. */
export function greeting(now = new Date()) {
  const hour = Number(hourFmt.format(now));
  if (hour >= 5 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
}
