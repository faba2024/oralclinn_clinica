"use client";

import { MoreHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";
import { Popover } from "./popover";

export interface MenuItem {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  danger?: boolean;
  disabled?: boolean;
  separatorBefore?: boolean;
}

interface DropdownMenuProps {
  items: MenuItem[];
  label?: string;
  trigger?: ReactNode;
  align?: "start" | "end";
  className?: string;
}

export function DropdownMenu({ items, label = "Mais ações", trigger, align = "end", className }: DropdownMenuProps) {
  return (
    <Popover
      align={align}
      className={cn("w-52", className)}
      trigger={({ open, toggle, ref }) => (
        <button
          ref={ref}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggle();
          }}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={label}
          className={cn(
            "inline-flex items-center justify-center rounded-lg text-subtle transition-colors hover:bg-sand hover:text-ink",
            trigger ? "" : "size-8",
            open && "bg-sand text-ink",
          )}
        >
          {trigger ?? <MoreHorizontal className="size-4" />}
        </button>
      )}
    >
      {(close) => (
        <div role="menu" aria-label={label} onClick={(e) => e.stopPropagation()}>
          {items.map((item) => (
            <div key={item.label}>
              {item.separatorBefore ? <div className="my-1 h-px bg-line" /> : null}
              <button
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  close();
                  item.onSelect();
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors disabled:opacity-40 [&_svg]:size-4",
                  item.danger ? "text-danger hover:bg-danger-soft" : "text-ink-2 hover:bg-sand",
                )}
              >
                {item.icon ? <span className={item.danger ? "" : "text-subtle"}>{item.icon}</span> : null}
                {item.label}
              </button>
            </div>
          ))}
        </div>
      )}
    </Popover>
  );
}
