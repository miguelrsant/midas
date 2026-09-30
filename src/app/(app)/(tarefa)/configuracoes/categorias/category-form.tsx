"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";

import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/app/(app)/_actions/categories";
import { CategoryIcon } from "@/components/midas/category-icon";
import { CheckboxField } from "@/components/midas/checkbox-field";
import { ConfirmInline } from "@/components/midas/confirm-inline";
import { useAnnounce } from "@/components/midas/golden-touch";
import { IconPicker } from "@/components/midas/icon-picker";
import { TaskHeader } from "@/components/midas/task-header";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { runAction, signInHref } from "@/lib/actions/client";
import { CATEGORY_NAME_MAX_LENGTH } from "@/lib/categories";
import type { EntryKind } from "@/lib/entry";
import { countOf } from "@/lib/plural";

/** Criar ou editar uma categoria (docs/design-system/15-categorias.md#personalização). */
export function CategoryForm({
  mode,
  kind,
  initial,
}: {
  mode: "new" | "edit";
  kind: EntryKind;
  initial?: {
    id: string;
    name: string;
    icon: string;
    hidden: boolean;
    system: boolean;
    isOther: boolean;
    original: { name: string; icon: string } | null;
    entries: number;
  };
}) {
  const router = useRouter();
  const { announce } = useAnnounce();
  const id = useId();
  const [name, setName] = useState(initial?.name ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "outros");
  const [shown, setShown] = useState(!(initial?.hidden ?? false));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dirty, setDirty] = useState(false);
  const back = "/configuracoes/categorias" as const;

  async function save() {
    setBusy(true);
    setFormError(null);
    setErrors({});
    const result =
      mode === "new"
        ? await runAction(() => createCategoryAction({ kind, name, icon }))
        : await runAction(() =>
            updateCategoryAction({
              id: initial!.id,
              name: name.trim() ? name : null,
              icon,
              hidden: !shown,
            }),
          );
    setBusy(false);
    if (!result.ok) {
      if (result.code === "session_expired") return router.push(signInHref() as typeof back);
      if (result.fields) setErrors(result.fields);
      else setFormError(result.message);
      return;
    }
    announce(result.data.message);
    router.push(back);
  }

  async function remove() {
    setDeleting(true);
    const result = await runAction(() => deleteCategoryAction(initial!.id));
    setDeleting(false);
    if (!result.ok) return setFormError(result.message);
    announce(result.data.message);
    router.push(back);
  }

  const title =
    mode === "new"
      ? kind === "income"
        ? "Criar categoria de renda"
        : "Criar categoria de gasto"
      : "Editar categoria";
  return (
    <>
      <TaskHeader title={title} backHref={back} dirty={dirty} />
      <form
        noValidate
        className="flex flex-col gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        {formError ? (
          <Notice tone="alerta" role="status">
            {formError}
          </Notice>
        ) : null}
        <p className="flex items-center gap-3 text-body text-tinta" aria-live="polite">
          <span className="text-caption text-tinta-suave">Como fica:</span>
          <CategoryIcon icon={icon} kind={kind} />
          <span className="font-semibold">
            {name.trim() || initial?.original?.name || "Nova categoria"}
          </span>
        </p>
        <TextField
          id={`${id}-nome`}
          label="Nome"
          help={
            initial?.system
              ? "Deixe em branco para usar o nome original."
              : `Até ${CATEGORY_NAME_MAX_LENGTH} caracteres.`
          }
          maxLength={CATEGORY_NAME_MAX_LENGTH}
          value={name}
          error={errors.name}
          onChange={(event) => {
            setName(event.target.value);
            setDirty(true);
          }}
        />
        <IconPicker
          value={icon}
          onValueChange={(key) => {
            setIcon(key);
            setDirty(true);
          }}
        />
        {errors.icon ? <p className="text-caption text-tinta">{errors.icon}</p> : null}
        {mode === "edit" && !initial?.isOther ? (
          <CheckboxField
            label="Mostrar no formulário"
            help="Escondida, ela sai dos chips, mas continua nos lançamentos antigos e nos gráficos."
            checked={shown}
            onChange={(value) => {
              setShown(value);
              setDirty(true);
            }}
          />
        ) : null}
        <Button type="submit" size="lg" fullWidth busy={busy} busyLabel="Salvando…">
          {mode === "new" ? "Criar categoria" : "Salvar alterações"}
        </Button>
        {initial?.system && initial.original ? (
          <Button
            variant="ghost"
            onClick={() => {
              setName("");
              setIcon(initial.original!.icon);
              setDirty(true);
            }}
          >
            Voltar ao nome e ao ícone originais
          </Button>
        ) : null}
        {mode === "edit" && initial && !initial.system ? (
          <div className="border-t border-veio pt-6">
            <ConfirmInline
              trigger="Apagar categoria"
              question={`Apagar “${initial.name}”? ${
                initial.entries > 0
                  ? `${countOf(initial.entries, "lançamento dela vai", "lançamentos dela vão")} para Outros.`
                  : "Nenhum lançamento usa ela."
              }`}
              confirmLabel="Apagar categoria"
              keepLabel="Manter categoria"
              busy={deleting}
              busyLabel="Apagando…"
              onConfirm={() => void remove()}
            />
          </div>
        ) : null}
      </form>
    </>
  );
}
