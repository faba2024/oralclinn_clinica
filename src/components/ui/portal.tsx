"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? createPortal(children, document.body) : null;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

let lockCount = 0;
const overlayStack: number[] = [];
let overlaySeq = 0;

/** Comportamento comum de overlays: ESC fecha, trava rolagem, prende e devolve o foco. */
export function useOverlay(open: boolean, onClose: () => void) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const overlayId = ++overlaySeq;
    overlayStack.push(overlayId);
    lockCount += 1;
    document.body.style.overflow = "hidden";

    const focusFirst = window.setTimeout(() => {
      const el = containerRef.current;
      if (!el) return;
      const target = el.querySelector<HTMLElement>("[data-autofocus]") ?? el.querySelector<HTMLElement>(FOCUSABLE);
      (target ?? el).focus();
    }, 20);

    const onKeyDown = (event: KeyboardEvent) => {
      // Apenas o overlay do topo reage (ex.: modal aberto sobre um drawer).
      if (overlayStack[overlayStack.length - 1] !== overlayId) return;
      if (event.key === "Escape") {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !containerRef.current) return;
      const nodes = Array.from(containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (n) => n.offsetParent !== null,
      );
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(focusFirst);
      document.removeEventListener("keydown", onKeyDown);
      const index = overlayStack.indexOf(overlayId);
      if (index >= 0) overlayStack.splice(index, 1);
      lockCount -= 1;
      if (lockCount <= 0) {
        lockCount = 0;
        document.body.style.overflow = "";
      }
      previouslyFocused?.focus?.();
    };
  }, [open]);

  return containerRef;
}
