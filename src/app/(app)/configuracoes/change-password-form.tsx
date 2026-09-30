"use client";

import { useRef, useState } from "react";

import { useFocusFirstError } from "@/components/auth/use-form-focus";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { PasswordField } from "@/components/ui/password-field";
import { authClient } from "@/lib/auth-client";
import { AUTH_MESSAGES, authErrorMessage } from "@/lib/auth/messages";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MESSAGES,
  PASSWORD_MIN_LENGTH,
  passwordLength,
  shortPasswordMessage,
} from "@/lib/auth/password-rules";

export function ChangePasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const focusFirstError = useFocusFirstError();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [errors, setErrors] = useState<{ current?: string | null; next?: string | null }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setStatus("");
    const length = passwordLength(next);
    const nextErrors = {
      current: current ? null : "Digite sua senha atual.",
      next:
        length < PASSWORD_MIN_LENGTH
          ? shortPasswordMessage(next)
          : length > PASSWORD_MAX_LENGTH
            ? PASSWORD_MESSAGES["too-long"]
            : null,
    };
    setErrors(nextErrors);
    if (nextErrors.current || nextErrors.next) {
      focusFirstError(formRef.current);
      return;
    }

    setBusy(true);
    try {
      const result = await authClient.changePassword({
        currentPassword: current,
        newPassword: next,
        revokeOtherSessions: true,
      });
      if (result.error) {
        const message = authErrorMessage(result.error);
        if (result.error.code === "INVALID_PASSWORD") setErrors({ current: message });
        else if (result.error.code?.startsWith("PASSWORD_")) setErrors({ next: message });
        else setFormError(message);
        focusFirstError(formRef.current);
        return;
      }
      setCurrent("");
      setNext("");
      setStatus("Senha trocada. Os outros aparelhos saíram da sua conta.");
    } catch {
      setFormError(AUTH_MESSAGES.network);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
      <PasswordField
        id="senha-atual"
        label="Senha atual"
        autoComplete="current-password"
        value={current}
        onChange={(event) => setCurrent(event.target.value)}
        error={errors.current}
        forceHidden={busy}
      />
      <PasswordField
        id="senha-nova"
        label="Senha nova"
        autoComplete="new-password"
        value={next}
        onChange={(event) => setNext(event.target.value)}
        help="Use 8 caracteres ou mais. Uma frase fácil de lembrar funciona bem."
        error={errors.next}
        forceHidden={busy}
      />
      <div role="alert">{formError ? <Notice tone="alerta">{formError}</Notice> : null}</div>
      <div>
        <Button type="submit" variant="secondary" busy={busy}>
          {busy ? "Trocando…" : "Trocar senha"}
        </Button>
      </div>
      <p role="status" className="text-caption text-tinta-suave">
        {status}
      </p>
    </form>
  );
}
