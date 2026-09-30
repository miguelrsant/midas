import type { DateOnly } from "@/lib/dates";

/**
 * Contribuição do empregado ao INSS, progressiva por faixa (EC 103/2019, art. 28).
 * Cada vigência nova entra como um item novo; as antigas nunca são alteradas.
 * Valores em centavos; alíquotas em centésimos de ponto percentual (750 = 7,5%).
 */

export interface InssTable {
  id: string;
  validFrom: DateOnly;
  source: string;
  brackets: ReadonlyArray<{ upToCents: number; rateBp: number }>;
}

export const INSS_TABLES: readonly InssTable[] = [
  {
    id: "inss-2025",
    validFrom: "2025-01-01",
    source: "Portaria Interministerial MPS/MF nº 6, de 10 de janeiro de 2025, Anexo II",
    brackets: [
      { upToCents: 151_800, rateBp: 750 },
      { upToCents: 279_388, rateBp: 900 },
      { upToCents: 419_083, rateBp: 1200 },
      { upToCents: 815_741, rateBp: 1400 },
    ],
  },
  {
    id: "inss-2026",
    validFrom: "2026-01-01",
    source: "Portaria Interministerial MPS/MF nº 13, de 9 de janeiro de 2026, Anexo II",
    brackets: [
      { upToCents: 162_100, rateBp: 750 },
      { upToCents: 290_284, rateBp: 900 },
      { upToCents: 435_427, rateBp: 1200 },
      { upToCents: 847_555, rateBp: 1400 },
    ],
  },
];
