"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useSyncExternalStore } from "react";

import { useAnnounce } from "./golden-touch";

const KEY = "midas.discreto";

function subscribe(callback: () => void) {
  window.addEventListener("midas:discreto", callback);
  return () => window.removeEventListener("midas:discreto", callback);
}

const isOn = () => document.documentElement.hasAttribute("data-discreto");

export function setDiscreet(on: boolean) {
  if (on) document.documentElement.setAttribute("data-discreto", "");
  else document.documentElement.removeAttribute("data-discreto");
  try {
    if (on) localStorage.setItem(KEY, "1");
    else localStorage.removeItem(KEY);
  } catch {
    // Sem armazenamento (janela privada): vale só nesta página.
  }
  window.dispatchEvent(new Event("midas:discreto"));
}

/** Botão "Ocultar valores" / "Mostrar valores". */
export function DiscreetToggle({ variant = "button" }: { variant?: "button" | "switch" }) {
  const on = useSyncExternalStore(subscribe, isOn, () => false);
  const { announce } = useAnnounce();
  const switchId = useId();
  const toggle = () => {
    setDiscreet(!on);
    announce(on ? "Valores à mostra." : "Valores ocultos neste aparelho.");
  };
  if (variant === "switch") {
    return (
      <div className="flex min-h-12 items-center justify-between gap-4">
        <span>
          <label htmlFor={switchId} className="block cursor-pointer text-label text-tinta">
            Ocultar valores
          </label>
          <span id={`${switchId}-ajuda`} className="block text-caption text-tinta-suave">
            Vale só neste aparelho. Bom para usar em público.
          </span>
        </span>
        <input
          id={switchId}
          type="checkbox"
          role="switch"
          aria-describedby={`${switchId}-ajuda`}
          checked={on}
          onChange={toggle}
          className="size-6 flex-none accent-[var(--ouro)]"
        />
      </div>
    );
  }
  const Icon = on ? Eye : EyeOff;
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-label text-ouro-texto hover:bg-superficie-funda focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco"
    >
      <Icon aria-hidden="true" className="size-5" strokeWidth={1.75} />
      {on ? "Mostrar valores" : "Ocultar valores"}
    </button>
  );
}
