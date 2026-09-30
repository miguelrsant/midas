import { TIME_ZONE } from "./dates";

/** Saudação e data do topo do painel (docs/design-system/componentes/app-header.md). */

const hourFmt = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TIME_ZONE,
  hour: "numeric",
  hourCycle: "h23",
});
const weekdayFmt = new Intl.DateTimeFormat("pt-BR", { timeZone: TIME_ZONE, weekday: "long" });
const dayMonthFmt = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "long",
});

/** "Bom dia" (5h a 11h59), "Boa tarde" (12h a 17h59) ou "Boa noite", pela hora de Brasília. */
export function salutation(now = new Date()) {
  const hour = Number(hourFmt.format(now));
  if (hour >= 5 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
}

/** "Quarta, 30 de setembro" */
export function longDate(now = new Date()) {
  const weekday = weekdayFmt.format(now).replace(/-feira$/, "");
  return `${weekday.charAt(0).toLocaleUpperCase("pt-BR")}${weekday.slice(1)}, ${dayMonthFmt.format(now)}`;
}

/** Iniciais do avatar: "Ana Luiza" → "AL", "Miguel" → "M", "Érica" → "É". Sem letra: null. */
export function initials(nickname?: string | null): string | null {
  const letters = (nickname ?? "")
    .trim()
    .split(/\s+/)
    .map((word) => word.match(/\p{L}/u)?.[0])
    .filter((letter): letter is string => Boolean(letter));
  if (letters.length === 0) return null;
  return letters
    .slice(0, letters.length > 1 ? 2 : 1)
    .join("")
    .toLocaleUpperCase("pt-BR");
}
