import { Calculator, ChartColumn, House, List, type LucideIcon } from "lucide-react";
import type { Route } from "next";

/** Os quatro destinos do app (docs/design-system/17-padroes-de-tela.md#estrutura-do-app). */
export const NAV_ITEMS: ReadonlyArray<{
  href: Route;
  label: string;
  icon: LucideIcon;
}> = [
  { href: "/", label: "Início", icon: House },
  { href: "/lancamentos", label: "Lançamentos", icon: List },
  { href: "/planejamento", label: "Planejamento", icon: ChartColumn },
  { href: "/calculadoras", label: "Calculadoras", icon: Calculator },
];

export function isCurrent(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
