"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import { Accent, AuthTitle, GoldVein } from "@/components/auth/auth-shell";
import { useFocusFirstError } from "@/components/auth/use-form-focus";
import { Button } from "@/components/ui/button";
import { FieldMessages, TextField } from "@/components/ui/field";
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
import { TERMS_VERSION } from "@/lib/legal";
import { checkEmail, checkNickname, NICKNAME_MAX_LENGTH } from "@/lib/validation";

type Errors = {
  nickname?: string | null;
  email?: string | null;
  password?: string | null;
  terms?: string | null;
};

export function SignUpForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const focusFirstError = useFocusFirstError();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const length = passwordLength(password);

  function validate(): { errors: Errors; email: string; nickname: string } {
    const checked = checkEmail(email);
    const name = checkNickname(nickname);
    return {
      email: checked.email,
      nickname: name.nickname,
      errors: {
        nickname: name.error,
        email: checked.error,
        password:
          length < PASSWORD_MIN_LENGTH
            ? shortPasswordMessage(password)
            : length > PASSWORD_MAX_LENGTH
              ? PASSWORD_MESSAGES["too-long"]
              : null,
        terms: accepted ? null : "Para criar a conta, marque que aceita a Política de privacidade.",
      },
    };
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const result = validate();
    setErrors(result.errors);
    if (Object.values(result.errors).some(Boolean)) {
      focusFirstError(formRef.current);
      return;
    }

    setBusy(true);
    try {
      const { error } = await authClient.signUp.email({
        email: result.email,
        password,
        name: result.nickname,
        termsVersion: TERMS_VERSION,
        callbackURL: "/confirmar-email",
      });
      if (error) {
        const message = authErrorMessage(error);
        if (error.code?.startsWith("PASSWORD_")) {
          setErrors({ password: message });
          focusFirstError(formRef.current);
        } else {
          setFormError(message);
        }
        return;
      }
      setSentTo(result.email);
      requestAnimationFrame(() => document.getElementById("confirmacao")?.focus());
    } catch {
      setFormError(AUTH_MESSAGES.network);
    } finally {
      setBusy(false);
    }
  }

  if (sentTo) {
    return (
      <div role="status" className="flex flex-col gap-3">
        <AuthTitle id="confirmacao">
          Falta <Accent>pouco</Accent>.
        </AuthTitle>
        <p className="text-center">
          Enviamos um link para <strong className="font-semibold break-all">{sentTo}</strong>. Abra
          para confirmar sua conta.
        </p>
        <p className="text-center text-caption text-tinta-suave">
          Não chegou? Confira a caixa de spam. O link vale por 24 horas.
        </p>
        <p className="text-center">
          <Link href="/entrar" className="md-link">
            Voltar para a entrada
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} className="flex flex-col gap-3">
      <AuthTitle>
        Suas finanças <Accent>em ordem</Accent>.
      </AuthTitle>

      <TextField
        id="apelido"
        name="nickname"
        label="Nome"
        autoComplete="nickname"
        maxLength={NICKNAME_MAX_LENGTH}
        value={nickname}
        onChange={(event) => setNickname(event.target.value)}
        help="Como o Midas vai te chamar. Pode ser um apelido."
        error={errors.nickname}
      />
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
        help="Para entrar e recuperar a senha."
        error={errors.email}
      />
      <PasswordField
        id="senha"
        name="password"
        label="Senha"
        autoComplete="new-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        help={
          <>
            Use {PASSWORD_MIN_LENGTH} caracteres ou mais.{" "}
            {/* O contador some quando o erro já diz quanto falta. */}
            <span aria-live="polite">
              {!errors.password && length > 0 && length < PASSWORD_MIN_LENGTH
                ? `${length} de ${PASSWORD_MIN_LENGTH} caracteres.`
                : ""}
            </span>
          </>
        }
        error={errors.password}
        forceHidden={busy}
      />

      <div className="flex flex-col gap-2">
        <label htmlFor="aceite" className="flex min-h-11 cursor-pointer items-start gap-3">
          <input
            id="aceite"
            name="terms"
            type="checkbox"
            checked={accepted}
            onChange={(event) => setAccepted(event.target.checked)}
            aria-invalid={errors.terms ? true : undefined}
            aria-describedby={errors.terms ? "aceite-erro" : undefined}
            className="mt-0.5 size-6 flex-none accent-(--primario)"
          />
          <span>
            Li e aceito os{" "}
            <Link href="/termos" target="_blank" className="md-link">
              Termos de uso<span className="md-sr"> (abre em nova aba)</span>
            </Link>{" "}
            e a{" "}
            <Link href="/privacidade" target="_blank" className="md-link">
              Política de privacidade<span className="md-sr"> (abre em nova aba)</span>
            </Link>
            .
          </span>
        </label>
        <FieldMessages id="aceite" error={errors.terms} />
      </div>

      <div role="alert">{formError ? <Notice tone="alerta">{formError}</Notice> : null}</div>

      <Button type="submit" size="lg" fullWidth busy={busy}>
        {busy ? "Criando conta…" : "Criar conta"}
      </Button>
      <GoldVein />
      <p className="text-center text-caption text-tinta-suave">
        Já tem conta?{" "}
        <Link href="/entrar" className="md-link">
          Entrar
        </Link>
      </p>
    </form>
  );
}
