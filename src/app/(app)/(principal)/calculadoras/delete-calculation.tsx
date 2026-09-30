"use client";

import { useState } from "react";

import { deleteCalculationAction } from "@/app/(app)/_actions/calculators";
import { ConfirmInline } from "@/components/midas/confirm-inline";
import { useAnnounce } from "@/components/midas/golden-touch";
import { runAction } from "@/lib/actions/client";

export function DeleteCalculation({ id, label }: { id: string; label: string }) {
  const { announce } = useAnnounce();
  const [busy, setBusy] = useState(false);
  return (
    <ConfirmInline
      trigger="Apagar esta conta"
      question={`Apagar a conta de ${label}? As rendas previstas dela saem do planejamento.`}
      confirmLabel="Apagar conta"
      keepLabel="Manter conta"
      busy={busy}
      busyLabel="Apagando…"
      onConfirm={async () => {
        setBusy(true);
        const result = await runAction(() => deleteCalculationAction(id));
        setBusy(false);
        announce(result.ok ? result.data.message : result.message);
      }}
    />
  );
}
