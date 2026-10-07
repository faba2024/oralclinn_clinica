"use client";

import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useToastStore } from "@/stores/toast-store";
import { cn } from "@/utils/cn";

export function Toaster() {
  const { toasts, dismiss } = useToastStore();
  return (
    <div
      className="pointer-events-none fixed left-4 right-4 top-4 z-[100] flex flex-col items-end gap-2 sm:left-auto"
      role="region"
      aria-label="Notificações do sistema"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex w-full max-w-sm animate-slide-in-right items-start gap-3 rounded-[12px] border border-line bg-white p-3.5 pr-2.5 shadow-[var(--shadow-pop)]"
        >
          <span className={cn("mt-px", t.tone === "success" ? "text-success" : t.tone === "error" ? "text-danger" : "text-info")}>
            {t.tone === "success" ? <CheckCircle2 className="size-4" /> : t.tone === "error" ? <XCircle className="size-4" /> : <Info className="size-4" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-ink">{t.title}</p>
            {t.description ? <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted">{t.description}</p> : null}
          </div>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            className="rounded-md p-1 text-subtle hover:bg-sand hover:text-ink"
            aria-label="Fechar aviso"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
