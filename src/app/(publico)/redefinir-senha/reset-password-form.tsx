"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { Accent, AuthTitle } from "@/components/auth/auth-shell";
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

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const focusFirstError = useFocusFirstError();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const length = passwordLength(password);
    const problem =
      length < PASSWORD_MIN_LENGTH
        ? shortPasswordMessage(password)
        : length > PASSWORD_MAX_LENGTH
          ? PASSWORD_MESSAGES["too-long"]
          : null;
    setError(problem);
    if (problem) {
      focusFirstError(formRef.current);
      return;
    }

    setBusy(true);
    try {
      const result = await authClient.resetPassword({ newPassword: password, token });
      if (result.error) {
        const code = result.error.code;
        if (code === "INVALID_TOKEN" || code === "TOKEN_EXPIRED") setExpired(true);
        else if (code?.startsWith("PASSWORD_")) {
          setError(authErrorMessage(result.error));
          focusFirstError(formRef.current);
        } else setFormError(authErrorMessage(result.error));
        return;
      }
      router.replace("/entrar?senha=trocada");
    } catch {
      setFormError(AUTH_MESSAGES.network);
    } finally {
      setBusy(false);
    }
  }

  if (expired) return <ExpiredLink />;

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} className="flex flex-col gap-3">
      <AuthTitle>
        Uma senha <Accent>nova</Accent>.
      </AuthTitle>
      <PasswordField
        id="senha"
        name="password"
        label="Senha nova"
        autoComplete="new-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        help="Use 8 caracteres ou mais. Uma frase fácil de lembrar funciona bem."
        error={error}
        forceHidden={busy}
      />
      <p className="text-caption text-tinta-suave">
        Ao salvar, os outros aparelhos conectados à sua conta saem dela.
      </p>
      <div role="alert">{formError ? <Notice tone="alerta">{formError}</Notice> : null}</div>
      <Button type="submit" size="lg" fullWidth busy={busy}>
        {busy ? "Salvando…" : "Salvar senha nova"}
      </Button>
    </form>
  );
}

export function ExpiredLink() {
  return (
    <div className="flex flex-col gap-3">
      <AuthTitle>Esse link venceu.</AuthTitle>
      <p className="text-center">
        Os links para criar senha nova valem por 30 minutos e só uma vez. Peça um novo.
      </p>
      <Link href="/recuperar-senha" className="md-link text-center">
        Pedir novo link
      </Link>
    </div>
  );
}
