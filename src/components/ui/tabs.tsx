"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface TabItem<T extends string> {
  id: T;
  label: string;
  icon?: ReactNode;
  count?: number;
}

interface TabsProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  label?: string;
}

/** Abas com navegação por setas (padrão WAI-ARIA). */
export function Tabs<T extends string>({ items, value, onChange, className, label = "Seções" }: TabsProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);
  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const next = (index + (event.key === "ArrowRight" ? 1 : -1) + items.length) % items.length;
    onChange(items[next].id);
    listRef.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[next]?.focus();
  };
  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={label}
      className={cn("scrollbar-thin -mb-px flex gap-1 overflow-x-auto border-b border-line", className)}
    >
      {items.map((item, index) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(item.id)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={cn(
              "relative flex shrink-0 items-center gap-2 px-3 pb-3 pt-1 text-[13.5px] font-medium transition-colors duration-150 [&_svg]:size-4",
              active ? "text-ink" : "text-muted hover:text-ink",
            )}
          >
            {item.icon ? <span className={active ? "text-gold-dark" : "text-subtle"}>{item.icon}</span> : null}
            {item.label}
            {item.count !== undefined ? (
              <span className={cn("rounded-full px-1.5 text-[11px] tabular", active ? "bg-ink text-white" : "bg-sand text-muted")}>
                {item.count}
              </span>
            ) : null}
            <span
              className={cn(
                "absolute inset-x-2 bottom-0 h-[2px] rounded-full transition-colors duration-200",
                active ? "bg-gold" : "bg-transparent",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

interface SegmentedProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  label?: string;
  size?: "sm" | "md";
}

export function Segmented<T extends string>({ options, value, onChange, className, label, size = "md" }: SegmentedProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("inline-flex rounded-[10px] bg-sand p-0.5", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-[8px] font-medium transition-all duration-150",
            size === "sm" ? "h-7 px-2.5 text-xs" : "h-8 px-3 text-[13px]",
            o.value === value ? "bg-white text-ink shadow-[0_1px_2px_rgba(32,32,32,0.08)]" : "text-muted hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
