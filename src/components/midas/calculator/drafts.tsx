"use client";

import { createContext, type ReactNode, useContext, useState } from "react";

/**
 * Respostas das calculadoras só na memória do navegador, enquanto a pessoa está nas
 * calculadoras (layout de /calculadoras/*). Nunca na URL nem no armazenamento do aparelho.
 * Deixa a rescisão passar as respostas para o seguro-desemprego.
 */
type Drafts = Record<string, Record<string, unknown>>;

const Context = createContext<{
  drafts: Drafts;
  setDraft: (key: string, value: Record<string, unknown>) => void;
} | null>(null);

export function CalculatorDraftsProvider({ children }: { children: ReactNode }) {
  const [drafts, setDrafts] = useState<Drafts>({});
  return (
    <Context.Provider
      value={{ drafts, setDraft: (key, value) => setDrafts((d) => ({ ...d, [key]: value })) }}
    >
      {children}
    </Context.Provider>
  );
}

export function useDrafts() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("CalculatorDraftsProvider ausente");
  return ctx;
}
