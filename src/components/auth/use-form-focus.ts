"use client";

import { useCallback } from "react";

/** Depois de um envio com erro, leva o foco ao primeiro campo marcado como inválido. */
export function useFocusFirstError() {
  return useCallback((form: HTMLFormElement | null) => {
    requestAnimationFrame(() => {
      form?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    });
  }, []);
}
