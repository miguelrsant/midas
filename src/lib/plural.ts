/** Plural em português com Intl.PluralRules: "1 lançamento", "2 lançamentos". */
const rules = new Intl.PluralRules("pt-BR");

export function plural(count: number, one: string, other: string): string {
  return rules.select(count) === "one" ? one : other;
}

/** "312 lançamentos" */
export function countOf(count: number, one: string, other: string): string {
  return `${new Intl.NumberFormat("pt-BR").format(count)} ${plural(count, one, other)}`;
}
