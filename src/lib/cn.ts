import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Junta classes e resolve conflitos do Tailwind (padrão do shadcn/ui).
 * O tailwind-merge precisa conhecer as escalas próprias do Midas; sem isso, ele
 * trataria "text-body" (tamanho) e "text-tinta" (cor) como o mesmo grupo e
 * descartaria um deles.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display-xl",
            "display-lg",
            "heading",
            "title",
            "body",
            "label",
            "caption",
            "amount",
          ],
        },
      ],
      rounded: [{ rounded: ["pill"] }],
      shadow: [{ shadow: ["cartao"] }],
    },
  },
});

export function cn(...classes: ClassValue[]) {
  return twMerge(clsx(classes));
}
