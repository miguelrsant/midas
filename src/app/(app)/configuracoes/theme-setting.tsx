"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const OPTIONS = [
  { value: "light", label: "Claro", done: "Tema claro ativado." },
  { value: "dark", label: "Escuro", done: "Tema escuro ativado." },
  { value: "system", label: "Automático", done: "Tema automático ativado: segue o aparelho." },
] as const;

/** A escolha fica só no aparelho (localStorage do next-themes), nunca no servidor. */
export function ThemeSetting() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState("");
  // eslint-disable-next-line react-hooks/set-state-in-effect -- o tema só é conhecido depois de montar.
  useEffect(() => setMounted(true), []);

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-label text-tinta">Tema</legend>
      {OPTIONS.map((option) => (
        <label key={option.value} className="flex min-h-12 cursor-pointer items-center gap-3">
          <input
            type="radio"
            name="tema"
            value={option.value}
            checked={mounted ? theme === option.value : option.value === "system"}
            onChange={() => {
              setTheme(option.value);
              setStatus(option.done);
            }}
            className="size-6 accent-(--primario)"
          />
          {option.label}
        </label>
      ))}
      <p role="status" className="text-caption text-tinta-suave">
        {status}
      </p>
    </fieldset>
  );
}
