"use client";

import { Download } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";

import { deleteAccountAction, exportDataAction } from "@/app/(app)/_actions/your-data";
import { useAnnounce } from "@/components/midas/golden-touch";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { PasswordField } from "@/components/ui/password-field";
import { runAction, signInHref } from "@/lib/actions/client";

/** Baixar meus dados: pede a senha, gera o arquivo na hora e baixa no próprio aparelho. */
export function ExportData() {
  const router = useRouter();
  const { announce } = useAnnounce();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [files, setFiles] = useState<{ json: string; csv: string; base: string } | null>(null);
  const id = useId();

  async function submit() {
    setBusy(true);
    setError(null);
    const result = await runAction(() => exportDataAction({ password }));
    setBusy(false);
    if (!result.ok) {
      if (result.code === "session_expired") {
        router.push(signInHref() as Route);
        return;
      }
      setError(result.message);
      return;
    }
    const make = (content: string, type: string) =>
      URL.createObjectURL(new Blob([content], { type }));
    setFiles({
      json: make(result.data.json, "application/json;charset=utf-8"),
      csv: make(result.data.csv, "text/csv;charset=utf-8"),
      base: result.data.fileBase,
    });
    setPassword("");
    setOpen(false);
    announce("Seu arquivo está pronto para baixar.");
  }

  const link =
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-borda bg-superficie px-6 text-label text-tinta hover:bg-superficie-funda focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco";

  return (
    <div className="flex flex-col gap-3">
      {files ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <a href={files.json} download={`${files.base}.json`} className={link}>
            <Download aria-hidden="true" className="size-5" strokeWidth={1.75} />
            Baixar tudo (JSON)
          </a>
          <a href={files.csv} download={`${files.base}.csv`} className={link}>
            <Download aria-hidden="true" className="size-5" strokeWidth={1.75} />
            Baixar lançamentos (planilha CSV)
          </a>
        </div>
      ) : (
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Baixar meus dados
        </Button>
      )}
      <Dialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value);
          if (!value) {
            setPassword("");
            setError(null);
          }
        }}
      >
        <DialogContent>
          <DialogTitle>Por segurança, digite sua senha para continuar.</DialogTitle>
          <DialogDescription>
            O arquivo é gerado agora e baixado só neste aparelho.
          </DialogDescription>
          <form
            noValidate
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
          >
            <PasswordField
              id={`${id}-senha`}
              label="Senha"
              autoComplete="current-password"
              value={password}
              error={error}
              onChange={(event) => setPassword(event.target.value)}
            />
            <Button type="submit" busy={busy} busyLabel="Conferindo…">
              Baixar meus dados
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Apagar a conta: o bloco aparece na própria tela, com a senha e dois botões claros. */
export function DeleteAccount({ entries }: { entries: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const id = useId();

  async function submit() {
    setBusy(true);
    setError(null);
    const result = await runAction(() => deleteAccountAction({ password }));
    if (!result.ok) {
      setBusy(false);
      if (result.code === "session_expired") {
        router.push(signInHref() as Route);
        return;
      }
      setError(result.message);
      return;
    }
    window.location.replace("/conta-apagada");
  }

  if (!open) {
    return (
      <Button variant="danger" onClick={() => setOpen(true)}>
        Apagar minha conta
      </Button>
    );
  }
  return (
    <form
      noValidate
      aria-labelledby={`${id}-titulo`}
      className="flex flex-col gap-4 rounded-md border border-gasto bg-superficie p-4"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <p id={`${id}-titulo`} className="text-body text-tinta">
        Isso apaga sua conta, {entries} e as respostas das calculadoras. Não dá para desfazer.
      </p>
      <p className="text-caption text-tinta-suave">
        Quer baixar seus dados antes? Use o botão da seção acima.
      </p>
      <PasswordField
        id={`${id}-senha`}
        label="Digite sua senha para confirmar"
        autoComplete="current-password"
        value={password}
        error={error}
        onChange={(event) => setPassword(event.target.value)}
      />
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="submit" variant="danger" busy={busy} busyLabel="Apagando…">
          Apagar minha conta e meus dados
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setOpen(false);
            setPassword("");
            setError(null);
          }}
        >
          Manter minha conta
        </Button>
      </div>
    </form>
  );
}
