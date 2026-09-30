import { Info, ShieldCheck, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/** docs/design-system/componentes/notice.md */

type NoticeTone = "info" | "alerta" | "privacidade";

const icons = { info: Info, alerta: TriangleAlert, privacidade: ShieldCheck };

export function Notice({
  tone = "info",
  children,
  className,
  role,
}: {
  tone?: NoticeTone;
  children: ReactNode;
  className?: string;
  role?: "note" | "status" | "alert";
}) {
  const Icon = icons[tone];
  return (
    <div
      role={role}
      className={cn(
        "flex gap-3 rounded-md border border-veio bg-superficie p-4 text-[0.9375rem] leading-[1.375rem] text-tinta",
        className,
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn(
          "mt-px size-5 flex-none",
          tone === "alerta" ? "text-alerta" : "text-ouro-texto",
        )}
        strokeWidth={1.75}
      />
      <div className="min-w-0 [&_strong]:font-semibold">{children}</div>
    </div>
  );
}
