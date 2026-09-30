"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import { Accent, AuthTitle, GoldVein } from "@/components/auth/auth-shell";
import { useFocusFirstError } from "@/components/auth/use-form-focus";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { authClient } from "@/lib/auth-client";
import { AUTH_MESSAGES } from "@/lib/auth/messages";
import { checkEmail } from "@/lib/validation";

export function ForgotPasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const focusFirstError = useFocusFirstError();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const checked = checkEmail(email);
    setError(checked.error);
    if (checked.error) {
      focusFirstError(formRef.current);
      return;
    }

    setBusy(true);
    try {
      const result = await authClient.requestPasswordReset({
        email: checked.email,
        redirectTo: "/redefinir-senha",
      });
      // A resposta é a mesma exista ou não a conta. Só o limite de tentativas muda a tela.
      if (result.error?.status === 429) {
        setFormError(AUTH_MESSAGES.tooManyAttempts);
        return;
      }
      setSent(true);
      requestAnimationFrame(() => document.getElementById("confirmacao")?.focus());
    } catch {
      setFormError(AUTH_MESSAGES.network);
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-4">
        <AuthTitle id="confirmacao">
          Confira seu <Accent>e-mail</Accent>.
        </AuthTitle>
        <div role="status">
          <Notice>{AUTH_MESSAGES.resetSent}</Notice>
        </div>
        <p className="text-center text-caption text-tinta-suave">O link vale por 30 minutos.</p>
        <p className="text-center">
          <Link href="/entrar" className="md-link">
            Voltar para a entrada
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
      <AuthTitle>
        Esqueceu a senha? <Accent>Acontece</Accent>.
      </AuthTitle>
      <p className="text-center text-tinta-suave">
        Digite seu e-mail. Vamos mandar um link para você criar uma senha nova.
      </p>
      <TextField
        id="email"
        name="email"
        type="email"
        label="E-mail"
        autoComplete="email"
        inputMode="email"
        autoCapitalize="none"
        spellCheck={false}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={error}
      />
      <div role="alert">{formError ? <Notice tone="alerta">{formError}</Notice> : null}</div>
      <Button type="submit" size="lg" fullWidth busy={busy}>
        {busy ? "Enviando…" : "Enviar link"}
      </Button>
      <GoldVein />
      <p className="text-center text-caption text-tinta-suave">
        Lembrou a senha?{" "}
        <Link href="/entrar" className="md-link">
          Entrar
        </Link>
      </p>
    </form>
  );
}
