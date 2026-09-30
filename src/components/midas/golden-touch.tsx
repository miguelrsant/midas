"use client";

import {
  createContext,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/cn";

/**
 * Toque de ouro e aviso depois de uma ação (docs/design-system/componentes/golden-touch.md).
 * A região role="status" existe desde o primeiro render, no layout raiz; o texto é trocado
 * a cada ação, fica 4 s e não tem botão. A onda só aparece em "Salvar gasto/renda" novo.
 */

interface GoldenTouchContext {
  announce: (message: string, opts?: { coin?: boolean }) => void;
  highlightId: string | null;
  highlight: (id: string) => void;
}

const Context = createContext<GoldenTouchContext | null>(null);

export function useAnnounce() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("GoldenTouchProvider ausente");
  return ctx;
}

export function GoldenTouchProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<{ text: string; coin: boolean; key: number } | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const announce = useCallback((text: string, opts?: { coin?: boolean }) => {
    if (timer.current) clearTimeout(timer.current);
    setMessage({ text, coin: opts?.coin ?? false, key: Date.now() });
    timer.current = setTimeout(() => setMessage(null), 4000);
  }, []);

  const highlight = useCallback((id: string) => {
    setHighlightId(id);
    setTimeout(() => setHighlightId((current) => (current === id ? null : current)), 1500);
  }, []);

  const value = useMemo(
    () => ({ announce, highlightId, highlight }),
    [announce, highlightId, highlight],
  );

  return (
    <Context.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-40 flex justify-center px-4 lg:bottom-6"
      >
        {message ? (
          <p
            key={message.key}
            className="flex max-w-120 items-center gap-3 rounded-pill bg-tinta px-5 py-3 text-label text-marmore shadow-cartao dark:bg-superficie-funda dark:text-tinta"
          >
            {message.coin ? <span aria-hidden="true" className="md-moeda size-[22px]" /> : null}
            <span>{message.text}</span>
          </p>
        ) : null}
      </div>
    </Context.Provider>
  );
}

/** A onda dourada que sai do ponto do toque (ou do centro, pelo teclado). */
export function useRipple() {
  const [ripple, setRipple] = useState<{ x: number; y: number; key: number } | null>(null);
  const origin = useRef<{ x: number; y: number } | null>(null);

  const onPointerDown = useCallback((event: PointerEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    origin.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }, []);

  /** Toca a onda e resolve quando ela termina (na hora, com movimento reduzido). */
  const play = useCallback((button: HTMLButtonElement | null) => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !button) return Promise.resolve();
    const rect = button.getBoundingClientRect();
    const point = origin.current ?? { x: rect.width / 2, y: rect.height / 2 };
    origin.current = null;
    setRipple({ ...point, key: Date.now() });
    return new Promise<void>((resolve) => setTimeout(resolve, 650));
  }, []);

  const element = ripple ? <Ripple key={ripple.key} x={ripple.x} y={ripple.y} /> : null;
  return { onPointerDown, play, element };
}

function Ripple({ x, y }: { x: number; y: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  // Posição pelo CSSOM (a CSP permite; style="" vindo do servidor, não).
  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.left = `${x}px`;
    ref.current.style.top = `${y}px`;
  }, [x, y]);
  return <span ref={ref} aria-hidden="true" className="md-onda" />;
}

/** Linha recém-salva: um reflexo dourado, uma vez. */
export function Highlightable({
  id,
  children,
  className,
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  const ctx = useContext(Context);
  return <div className={cn(className, ctx?.highlightId === id && "md-brilho")}>{children}</div>;
}
