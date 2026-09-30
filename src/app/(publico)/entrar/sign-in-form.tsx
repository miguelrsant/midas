"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { Accent, AuthTitle, GoldVein } from "@/components/auth/auth-shell";
import { useFocusFirstError } from "@/components/auth/use-form-focus";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { PasswordField } from "@/components/ui/password-field";
import { authClient } from "@/lib/auth-client";
import { AUTH_MESSAGES, authErrorMessage } from "@/lib/auth/messages";
import { checkEmail } from "@/lib/validation";

export function SignInForm({ redirectTo, notice }: { redirectTo: string; notice: string | null }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const focusFirstError = useFocusFirstError();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string | null; password?: string | null }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(notice);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setInfo(null);

    const checked = checkEmail(email);
    const nextErrors = { email: checked.error, password: password ? null : "Digite sua senha." };
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) {
      focusFirstError(formRef.current);
      return;
    }

    setBusy(true);
    try {
      const { error } = await authClient.signIn.email({ email: checked.email, password });
      if (error) {
        if (error.code === "EMAIL_NOT_VERIFIED") setInfo(AUTH_MESSAGES.emailNotVerified);
        else setFormError(authErrorMessage(error));
        return;
      }
      router.replace(redirectTo as Route);
      router.refresh();
    } catch {
      setFormError(AUTH_MESSAGES.network);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
      <AuthTitle>
        Que bom te ver <Accent>de novo</Accent>.
      </AuthTitle>

      {info ? <Notice role="status">{info}</Notice> : null}

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
        error={errors.email}
      />
      <PasswordField
        id="senha"
        name="password"
        label="Senha"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
        forceHidden={busy}
      />

      <div role="alert">{formError ? <Notice tone="alerta">{formError}</Notice> : null}</div>

      <Button type="submit" size="lg" fullWidth busy={busy}>
        {busy ? "Entrando…" : "Entrar"}
      </Button>
      <p className="text-center">
        <Link href="/recuperar-senha" className="md-link">
          Esqueci minha senha
        </Link>
      </p>
      <GoldVein />
      <p className="text-center text-caption text-tinta-suave">
        Ainda não tem conta?{" "}
        <Link href="/criar-conta" className="md-link">
          Criar conta
        </Link>
      </p>
    </form>
  );
}
