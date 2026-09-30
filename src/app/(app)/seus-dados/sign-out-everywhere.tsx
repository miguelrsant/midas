"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth/messages";

export function SignOutEverywhere() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!confirming) {
    return (
      <div>
        <Button variant="secondary" onClick={() => setConfirming(true)}>
          Sair de todos os aparelhos
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-md border border-borda p-4">
      <p>Todos os aparelhos saem da sua conta, inclusive este. Você vai precisar entrar de novo.</p>
      <div role="alert">{error ? <Notice tone="alerta">{error}</Notice> : null}</div>
      <div className="flex flex-wrap gap-3">
        <Button
          busy={busy}
          onClick={async () => {
            setBusy(true);
            const result = await authClient.revokeSessions();
            if (result.error) {
              setBusy(false);
              setError(authErrorMessage(result.error));
              return;
            }
            router.replace("/entrar");
            router.refresh();
          }}
        >
          Sair de todos
        </Button>
        <Button variant="secondary" onClick={() => setConfirming(false)}>
          Continuar conectado
        </Button>
      </div>
    </div>
  );
}
