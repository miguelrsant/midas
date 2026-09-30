"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth/messages";
import { checkNickname, NICKNAME_MAX_LENGTH } from "@/lib/validation";

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
        const { nickname: name, error: problem } = checkNickname(value);
        if (problem) {
          setError(problem);
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
        setStatus(`Pronto. O Midas vai te chamar de ${name}.`);
        router.refresh();
      }}
    >
      <TextField
        id="apelido"
        label="Nome"
        autoComplete="nickname"
        maxLength={NICKNAME_MAX_LENGTH}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        help="Como o Midas vai te chamar. Pode ser um apelido."
        error={error}
      />
      <div>
        <Button type="submit" variant="secondary" busy={busy}>
          Salvar nome
        </Button>
      </div>
      <p role="status" className="text-caption text-tinta-suave">
        {status}
      </p>
    </form>
  );
}
