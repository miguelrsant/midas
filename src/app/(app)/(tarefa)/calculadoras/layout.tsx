import type { ReactNode } from "react";

import { CalculatorDraftsProvider } from "@/components/midas/calculator/drafts";

/** As respostas ficam na memória enquanto a pessoa está nas calculadoras. */
export default function CalculatorsLayout({ children }: { children: ReactNode }) {
  return <CalculatorDraftsProvider>{children}</CalculatorDraftsProvider>;
}
