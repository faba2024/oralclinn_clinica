"use client";

import { useEffect } from "react";
import { getDataBackend } from "@/repositories/core/backend";
import { dataBus } from "@/repositories/core/data-bus";

const COLLECTIONS = [
  "patients", "professionals", "treatments", "appointments", "leads", "clinical-records", "treatment-plans",
  "receivables", "expenses", "before-after", "documents", "notifications", "users", "site-content", "settings",
];
const INTERVAL = 20_000;

/**
 * Mantém o painel sincronizado com o banco: novos agendamentos e contatos feitos
 * no site aparecem sozinhos (a cada 20 s com a aba visível e ao voltar para a aba).
 */
export function useLiveRefresh() {
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState !== "visible") return;
      (getDataBackend() as { clearCache?: () => void }).clearCache?.();
      COLLECTIONS.forEach((c) => dataBus.emit(c, { local: true }));
    };
    const timer = window.setInterval(refresh, INTERVAL);
    const onVisible = () => document.visibilityState === "visible" && refresh();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
}
