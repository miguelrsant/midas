import { describe, expect, it } from "vitest";

import { csvAmount, csvText, toCsv } from "./csv";

describe("CSV", () => {
  it("neutraliza fórmulas, inclusive as de largura total", () => {
    expect(csvText('=HYPERLINK("http://x","y")')).toBe(`"'=HYPERLINK(""http://x"",""y"")"`);
    expect(csvText("+55")).toBe(`"'+55"`);
    expect(csvText("-5")).toBe(`"'-5"`);
    expect(csvText("@SUM(A1)")).toBe(`"'@SUM(A1)"`);
    expect(csvText("＝1+1")).toBe(`"'＝1+1"`);
    expect(csvText("Mercado")).toBe(`"Mercado"`);
    expect(csvText(null)).toBe(`""`);
  });

  it("valores com vírgula decimal", () => {
    expect(csvAmount(12790)).toBe("127,90");
    expect(csvAmount(-850)).toBe("-8,50");
    expect(csvAmount(5)).toBe("0,05");
  });

  it("BOM, ponto e vírgula e CRLF", () => {
    const csv = toCsv(["data", "valor"], [[csvText("2026-09-30"), csvAmount(100)]]);
    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv).toBe(`﻿"data";"valor"\r\n"2026-09-30";1,00\r\n`);
  });
});
