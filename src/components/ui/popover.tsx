"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/utils/cn";

interface PopoverProps {
  trigger: (props: { open: boolean; toggle: () => void; ref: React.RefObject<HTMLButtonElement | null> }) => ReactNode;
  children: (close: () => void) => ReactNode;
  align?: "start" | "end";
  className?: string;
  side?: "bottom" | "top";
}

/** Popover leve ancorado ao gatilho; fecha com clique externo e ESC. */
export function Popover({ trigger, children, align = "start", className, side = "bottom" }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative inline-flex">
      {trigger({ open, toggle: () => setOpen((o) => !o), ref: triggerRef })}
      {open ? (
        <div
          className={cn(
            "absolute z-50 min-w-48 animate-scale-in rounded-[12px] border border-line bg-white p-1 shadow-[var(--shadow-pop)]",
            side === "bottom" ? "top-full mt-1.5" : "bottom-full mb-1.5",
            align === "end" ? "right-0 origin-top-right" : "left-0 origin-top-left",
            className,
          )}
        >
          {children(() => setOpen(false))}
        </div>
      ) : null}
    </div>
  );
}
