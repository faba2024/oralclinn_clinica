import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom" | "right";
  className?: string;
}

/** Tooltip em CSS puro: aparece no hover e no foco do teclado. */
export function Tooltip({ content, children, side = "top", className }: TooltipProps) {
  const position = {
    top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
    bottom: "top-full left-1/2 mt-2 -translate-x-1/2",
    right: "left-full top-1/2 ml-2 -translate-y-1/2",
  }[side];
  return (
    <span className={cn("group/tooltip relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[11.5px] font-medium text-white opacity-0 shadow-lg transition-opacity delay-150 duration-150 group-focus-within/tooltip:opacity-100 group-hover/tooltip:opacity-100",
          position,
        )}
      >
        {content}
      </span>
    </span>
  );
}
