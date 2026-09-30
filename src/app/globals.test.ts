import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/** Garante que o globals.css segue o tokens.json e que os dois blocos do Portoro são iguais. */

type Token = { name: string; value: string | { light: string; dark: string } };

const root = process.cwd();
const css = readFileSync(join(root, "src/app/globals.css"), "utf8");
const tokens = JSON.parse(readFileSync(join(root, "docs/design-system/tokens.json"), "utf8")) as {
  color: { tokens: Token[] };
};

function block(selector: string) {
  const start = css.indexOf(selector);
  expect(start, `bloco ${selector}`).toBeGreaterThan(-1);
  const open = css.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    if (css[i] === "}") depth--;
    if (depth === 0) return css.slice(open + 1, i);
  }
  throw new Error("bloco sem fim");
}

function vars(text: string) {
  const map = new Map<string, string>();
  for (const match of text.matchAll(/--([\w-]+):\s*([^;]+);/g))
    map.set(match[1]!, match[2]!.trim());
  return map;
}

/** Normaliza para comparar: referência {token} vira var(--token); espaços somem. */
function normalize(value: string | undefined) {
  if (value === undefined) return undefined;
  const resolved = value.startsWith("{") ? `var(--${value.slice(1, -1)})` : value;
  return resolved.replace(/\s+/g, "").toLowerCase();
}

describe("globals.css", () => {
  const light = vars(block(":root {"));
  const dark = vars(block(':root[data-theme="dark"]'));
  const darkMedia = vars(block(':root:not([data-theme="light"])'));

  it("os dois blocos do Portoro são iguais", () => {
    expect(Object.fromEntries(darkMedia)).toEqual(Object.fromEntries(dark));
  });

  for (const token of tokens.color.tokens) {
    it(`cor ${token.name} bate com o tokens.json`, () => {
      const expected =
        typeof token.value === "string" ? { light: token.value, dark: token.value } : token.value;
      expect(normalize(light.get(token.name))).toBe(normalize(expected.light));
      // Tokens que não mudam no escuro (os de gráfico) herdam o valor do claro.
      expect(normalize(dark.get(token.name) ?? light.get(token.name))).toBe(
        normalize(expected.dark),
      );
    });
  }
});
