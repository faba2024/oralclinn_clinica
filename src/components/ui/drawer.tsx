"use client";

import { X } from "lucide-react";
import { useId, type ReactNode } from "react";
import { cn } from "@/utils/cn";
import { Portal, useOverlay } from "./portal";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  side?: "right" | "left";
  width?: string;
  hideHeader?: boolean;
  label?: string;
}

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  side = "right",
  width = "sm:max-w-[460px]",
  hideHeader,
  label,
}: DrawerProps) {
  const ref = useOverlay(open, onClose);
  const titleId = useId();
  if (!open) return null;
  return (
    <Portal>
      <div className="fixed inset-0 z-[60]">
        <div className="absolute inset-0 animate-fade-in bg-ink/25 backdrop-blur-[1px]" onClick={onClose} aria-hidden />
        <aside
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-label={!title ? label : undefined}
          tabIndex={-1}
          className={cn(
            "absolute inset-y-0 flex w-full flex-col bg-white shadow-[var(--shadow-pop)] outline-none",
            width,
            side === "right" ? "right-0 animate-slide-in-right" : "left-0 animate-slide-in-left",
          )}
        >
          {!hideHeader ? (
            <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
              <div className="min-w-0">
                {title ? (
                  <h2 id={titleId} className="text-base font-semibold tracking-[-0.01em]">
                    {title}
                  </h2>
                ) : null}
                {description ? <p className="mt-0.5 text-[13px] text-muted">{description}</p> : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="-mr-1.5 rounded-lg p-1.5 text-subtle transition-colors hover:bg-sand hover:text-ink"
                aria-label="Fechar painel"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : null}
          <div className="scrollbar-thin flex-1 overflow-y-auto">{children}</div>
          {footer ? <div className="border-t border-line bg-ivory/60 px-5 py-3.5">{footer}</div> : null}
        </aside>
      </div>
    </Portal>
  );
}
