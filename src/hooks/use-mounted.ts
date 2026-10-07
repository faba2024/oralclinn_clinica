"use client";

import { useEffect, useState } from "react";

/** Evita divergência de hidratação para conteúdo dependente do navegador. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
