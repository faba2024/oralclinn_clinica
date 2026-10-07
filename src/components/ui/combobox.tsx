"use client";

import { Check, ChevronsUpDown, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/utils/cn";
import { matchesSearch } from "@/utils/format";

export interface ComboOption {
  value: string;
  label: string;
  description?: string;
  keywords?: string;
  leading?: ReactNode;
}

interface ComboboxProps {
  options: ComboOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  id?: string;
  invalid?: boolean;
  footer?: (close: () => void, query: string) => ReactNode;
}

/** Seleção com busca — usada para pacientes, tratamentos e profissionais. */
export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Selecionar",
  searchPlaceholder = "Buscar…",
  emptyText = "Nada encontrado.",
  id,
  invalid,
  footer,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(
    () => options.filter((o) => matchesSearch(query, o.label, o.description, o.keywords)).slice(0, 50),
    [options, query],
  );

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    const t = setTimeout(() => inputRef.current?.focus(), 10);
    const onPointer = (e: PointerEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => {
      clearTimeout(t);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const choose = (option: ComboOption | undefined) => {
    if (!option) return;
    onChange(option.value);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={invalid || undefined}
        className={cn(
          "flex h-9 w-full items-center gap-2 rounded-[10px] border border-line bg-white px-3 text-left text-sm shadow-[0_1px_2px_rgba(32,32,32,0.03)] transition-[border,box-shadow] hover:border-line-strong focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/12 aria-[invalid=true]:border-danger",
          open && "border-gold ring-4 ring-gold/12",
        )}
      >
        {selected?.leading}
        <span className={cn("min-w-0 flex-1 truncate", selected ? "text-ink" : "text-subtle")}>{selected?.label ?? placeholder}</span>
        <ChevronsUpDown className="size-4 shrink-0 text-subtle" aria-hidden />
      </button>
      {open ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 animate-scale-in overflow-hidden rounded-[12px] border border-line bg-white shadow-[var(--shadow-pop)]">
          <div className="flex items-center gap-2 border-b border-line px-3">
            <Search className="size-4 text-subtle" aria-hidden />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActive((i) => Math.min(filtered.length - 1, i + 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActive((i) => Math.max(0, i - 1));
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  choose(filtered[active]);
                } else if (e.key === "Escape") {
                  e.stopPropagation();
                  setOpen(false);
                }
              }}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="h-10 flex-1 bg-transparent text-sm focus:outline-none"
            />
          </div>
          <ul role="listbox" className="scrollbar-thin max-h-60 overflow-y-auto p-1">
            {filtered.length === 0 ? <li className="px-3 py-6 text-center text-[13px] text-subtle">{emptyText}</li> : null}
            {filtered.map((o, i) => (
              <li
                key={o.value}
                role="option"
                aria-selected={o.value === value}
                onMouseMove={() => setActive(i)}
                onClick={() => choose(o)}
                className={cn("flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px]", i === active && "bg-sand")}
              >
                {o.leading}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-ink">{o.label}</span>
                  {o.description ? <span className="block truncate text-[12px] text-subtle">{o.description}</span> : null}
                </span>
                {o.value === value ? <Check className="size-4 text-gold-dark" /> : null}
              </li>
            ))}
          </ul>
          {footer ? <div className="border-t border-line p-1">{footer(() => setOpen(false), query)}</div> : null}
        </div>
      ) : null}
    </div>
  );
}
