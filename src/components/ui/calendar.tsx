"use client";

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/utils/cn";
import { todayISO } from "@/utils/dates";

interface CalendarProps {
  value: string | null;
  onChange: (date: string) => void;
  isDisabled?: (date: string) => boolean;
  minDate?: string;
  className?: string;
  marks?: Record<string, number>;
}

const WEEK = ["D", "S", "T", "Q", "Q", "S", "S"];

export function Calendar({ value, onChange, isDisabled, minDate, className, marks }: CalendarProps) {
  const [month, setMonth] = useState(() => startOfMonth(value ? parseISO(value) : new Date()));
  const days = eachDayOfInterval({ start: startOfWeek(startOfMonth(month)), end: endOfWeek(endOfMonth(month)) });
  const today = todayISO();
  const title = format(month, "MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className={cn("w-full select-none", className)}>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold cap-first text-ink">{title}</p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setMonth((m) => subMonths(m, 1))}
            className="rounded-lg p-1.5 text-muted hover:bg-sand hover:text-ink"
            aria-label="Mês anterior"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setMonth((m) => addMonths(m, 1))}
            className="rounded-lg p-1.5 text-muted hover:bg-sand hover:text-ink"
            aria-label="Próximo mês"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center" role="grid" aria-label={title}>
        {WEEK.map((d, i) => (
          <span key={i} className="pb-1 text-[11px] font-medium text-subtle" aria-hidden>
            {d}
          </span>
        ))}
        {days.map((day) => {
          const iso = format(day, "yyyy-MM-dd");
          const disabled = (minDate ? iso < minDate : false) || !!isDisabled?.(iso);
          const selected = iso === value;
          const outside = !isSameMonth(day, month);
          const mark = marks?.[iso];
          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => onChange(iso)}
              aria-pressed={selected}
              aria-label={format(day, "d 'de' MMMM", { locale: ptBR })}
              className={cn(
                "relative flex aspect-square items-center justify-center rounded-[9px] text-[13px] tabular transition-colors duration-150",
                outside && "text-line-strong",
                !outside && !selected && !disabled && "text-ink hover:bg-sand",
                disabled && "cursor-not-allowed text-line-strong line-through decoration-line",
                selected && "bg-ink font-semibold text-white",
                iso === today && !selected && "font-semibold text-gold-dark",
              )}
            >
              {format(day, "d")}
              {mark && !selected ? <span className="absolute bottom-1 size-1 rounded-full bg-gold" aria-hidden /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
