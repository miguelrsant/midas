/**
 * CSV para o Excel e o LibreOffice em português (.lgpd/dsar/workflow.md):
 * BOM UTF-8, separador ";", fim de linha CRLF e texto sempre entre aspas.
 * Texto que começa com = + - @ tabulação ou retorno (inclusive as formas de largura
 * total) ganha um apóstrofo na frente: sem isso, uma descrição poderia virar fórmula.
 */

const FORMULA_START = /^[=+\-@\t\r＝＋－＠]/;

export function csvText(value: string | null | undefined): string {
  let text = value ?? "";
  if (FORMULA_START.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

/** Valor em reais com vírgula decimal e sinal "-" ASCII (o Excel lê como número). */
export function csvAmount(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  return `${sign}${Math.floor(abs / 100)},${String(abs % 100).padStart(2, "0")}`;
}

export function toCsv(header: readonly string[], rows: ReadonlyArray<readonly string[]>): string {
  const lines = [header.map((h) => csvText(h)).join(";"), ...rows.map((r) => r.join(";"))];
  return `﻿${lines.join("\r\n")}\r\n`;
}
