"use client";

import { useEffect, useRef } from "react";

/** Registra um atalho com Ctrl/Cmd. Ex.: useHotkey("k", abrirBusca). */
export function useHotkey(key: string, handler: () => void, options: { meta?: boolean } = { meta: true }) {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const withMeta = event.metaKey || event.ctrlKey;
      if ((options.meta ? withMeta : !withMeta) && event.key.toLowerCase() === key.toLowerCase()) {
        event.preventDefault();
        handlerRef.current();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [key, options.meta]);
}
