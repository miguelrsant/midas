"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth/messages";

export function NicknameSetting({ initial }: { initial: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setStatus("");
        const name = value.trim();
        if (name.length > 40) {
          setError("Use no máximo 40 caracteres.");
          return;
        }
        setError(null);
        setBusy(true);
        const result = await authClient.updateUser({ name });
        setBusy(false);
        if (result.error) {
          setError(authErrorMessage(result.error));
          return;
        }
        setStatus(
          name ? `Pronto. O Midas vai te chamar de ${name}.` : "Pronto. A saudação fica sem nome.",
        );
        router.refresh();
      }}
    >
      <TextField
        id="apelido"
        label="Como você quer que o Midas te chame?"
        autoComplete="nickname"
        maxLength={40}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        help="Aparece na saudação do painel. Pode deixar em branco."
        error={error}
      />
      <div>
        <Button type="submit" variant="secondary" busy={busy}>
          Salvar apelido
        </Button>
      </div>
      <p role="status" className="text-caption text-tinta-suave">
        {status}
      </p>
    </form>
  );
}
