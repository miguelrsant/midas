import type { DateOnly } from "@/lib/dates";

/**
 * Seguro-desemprego (Lei 7.998/1990, art. 5º). Faixas reajustadas todo ano pelo INPC
 * (Resolução CODEFAT nº 957/2022), valendo a partir de 11 de janeiro.
 * Parcela: até faixa1 → 80% da média; até faixa2 → fixo + 50% do que passar de faixa1;
 * acima → teto. Nunca abaixo do salário mínimo.
 */

export interface UnemploymentTable {
  id: string;
  validFrom: DateOnly;
  source: string;
  band1UpToCents: number;
  band2UpToCents: number;
  band2BaseCents: number;
  ceilingCents: number;
  floorCents: number;
}

export const UNEMPLOYMENT_TABLES: readonly UnemploymentTable[] = [
  {
    id: "seguro-2025",
    validFrom: "2025-01-11",
    source: "Tabela do Ministério do Trabalho e Emprego de 2025 (Lei 7.998/1990, art. 5º)",
    band1UpToCents: 213_876,
    band2UpToCents: 356_496,
    band2BaseCents: 171_101,
    ceilingCents: 242_411,
    floorCents: 151_800,
  },
  {
    id: "seguro-2026",
    validFrom: "2026-01-11",
    source:
      "Tabela do Ministério do Trabalho e Emprego de 2026 (Lei 7.998/1990, art. 5º; INPC de 3,90%)",
    band1UpToCents: 222_217,
    band2UpToCents: 370_399,
    band2BaseCents: 177_774,
    ceilingCents: 251_865,
    floorCents: 162_100,
  },
];
