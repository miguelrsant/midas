/**
 * Escala do gráfico de meses (docs/design-system/13-graficos-e-dados.md#eixos-e-números):
 * de 3 a 5 marcas "redondas" (1, 2, 2,5 ou 5 × 10ⁿ reais), sempre a partir de zero.
 */
export function niceTicks(maxCents: number): number[] {
  if (maxCents <= 0) return [0, 50_000, 100_000];
  const magnitude = 10 ** Math.floor(Math.log10(Math.max(100, maxCents / 4)));
  const candidates = [1, 2, 2.5, 5, 10, 20, 25, 50].map((f) => f * magnitude);
  const step = candidates.find((s) => Math.ceil(maxCents / s) <= 4) ?? candidates.at(-1)!;
  const intervals = Math.max(2, Math.ceil(maxCents / step));
  return Array.from({ length: intervals + 1 }, (_, i) => Math.round(i * step));
}
