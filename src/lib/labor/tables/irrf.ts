import type { DateOnly } from "@/lib/dates";

/**
 * Imposto de Renda retido na fonte, tabela progressiva mensal (Lei 11.482/2007, art. 1º,
 * com as atualizações citadas em cada vigência). Parcela a deduzir em centavos;
 * alíquotas em centésimos de ponto percentual.
 */

export interface IrrfTable {
  id: string;
  validFrom: DateOnly;
  source: string;
  brackets: ReadonlyArray<{ upToCents: number | null; rateBp: number; deductionCents: number }>;
  dependentCents: number;
  /** Desconto simplificado mensal (Lei 14.663/2023; IN RFB 2.141/2023). */
  simplifiedCents: number;
  /**
   * Redução mensal pela renda tributável bruta (Lei 15.270/2025, art. 3º-A da Lei 9.250/1995).
   * Até fullUpTo: redução até fullMax (o imposto zera). Até partialUpTo:
   * a − renda × bPerMillion / 1.000.000. Acima: nada. Nunca passa do imposto.
   */
  reduction: null | {
    fullUpToCents: number;
    fullMaxCents: number;
    partialUpToCents: number;
    aCents: number;
    bPerMillion: number;
  };
}

export const IRRF_TABLES: readonly IrrfTable[] = [
  {
    id: "irrf-2024-02",
    validFrom: "2025-01-01",
    source: "Lei nº 14.848/2024 (tabela vigente de fevereiro de 2024 a abril de 2025)",
    brackets: [
      { upToCents: 225_920, rateBp: 0, deductionCents: 0 },
      { upToCents: 282_665, rateBp: 750, deductionCents: 16_944 },
      { upToCents: 375_105, rateBp: 1500, deductionCents: 38_144 },
      { upToCents: 466_468, rateBp: 2250, deductionCents: 66_277 },
      { upToCents: null, rateBp: 2750, deductionCents: 89_600 },
    ],
    dependentCents: 18_959,
    simplifiedCents: 56_480,
    reduction: null,
  },
  {
    id: "irrf-2025-05",
    validFrom: "2025-05-01",
    source: "Medida Provisória nº 1.294/2025, convertida na Lei nº 15.191/2025",
    brackets: [
      { upToCents: 242_880, rateBp: 0, deductionCents: 0 },
      { upToCents: 282_665, rateBp: 750, deductionCents: 18_216 },
      { upToCents: 375_105, rateBp: 1500, deductionCents: 39_416 },
      { upToCents: 466_468, rateBp: 2250, deductionCents: 67_549 },
      { upToCents: null, rateBp: 2750, deductionCents: 90_873 },
    ],
    dependentCents: 18_959,
    simplifiedCents: 60_720,
    reduction: null,
  },
  {
    id: "irrf-2026",
    validFrom: "2026-01-01",
    source:
      "Lei nº 15.191/2025 (tabela) e Lei nº 15.270/2025 (redução mensal, art. 3º-A da Lei nº 9.250/1995)",
    brackets: [
      { upToCents: 242_880, rateBp: 0, deductionCents: 0 },
      { upToCents: 282_665, rateBp: 750, deductionCents: 18_216 },
      { upToCents: 375_105, rateBp: 1500, deductionCents: 39_416 },
      { upToCents: 466_468, rateBp: 2250, deductionCents: 67_549 },
      { upToCents: null, rateBp: 2750, deductionCents: 90_873 },
    ],
    dependentCents: 18_959,
    simplifiedCents: 60_720,
    reduction: {
      fullUpToCents: 500_000,
      fullMaxCents: 31_289,
      partialUpToCents: 735_000,
      aCents: 97_862,
      bPerMillion: 133_145,
    },
  },
];

/** Retenção de até R$ 10,00 é dispensada (Lei 9.430/1996, art. 67), exceto em tributação exclusiva (13º). */
export const IRRF_MIN_WITHHOLDING_CENTS = 1_000;
