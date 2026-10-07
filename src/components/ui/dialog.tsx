"use client";

import { X } from "lucide-react";
import { useId, type ReactNode } from "react";
import { cn } from "@/utils/cn";
import { Portal, useOverlay } from "./portal";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl", xl: "max-w-5xl" };

export function Dialog({ open, onClose, title, description, children, footer, size = "md", className }: DialogProps) {
  const ref = useOverlay(open, onClose);
  const titleId = useId();
  const descId = useId();
  if (!open) return null;
  return (
    <Portal>
      <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
        <div className="absolute inset-0 animate-fade-in bg-ink/30 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descId : undefined}
          tabIndex={-1}
          className={cn(
            "relative flex max-h-[92dvh] w-full animate-scale-in flex-col overflow-hidden rounded-t-[20px] bg-white shadow-[var(--shadow-pop)] outline-none sm:rounded-[18px]",
            sizes[size],
            className,
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
            <div className="min-w-0">
              <h2 id={titleId} className="text-base font-semibold tracking-[-0.01em] text-ink">
                {title}
              </h2>
              {description ? (
                <p id={descId} className="mt-0.5 text-[13px] text-muted">
                  {description}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="-mr-1.5 rounded-lg p-1.5 text-subtle transition-colors hover:bg-sand hover:text-ink"
              aria-label="Fechar"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="scrollbar-thin flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
          {footer ? (
            <div className="flex flex-col-reverse gap-2 border-t border-line bg-ivory/60 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-end sm:px-6">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </Portal>
  );
}
