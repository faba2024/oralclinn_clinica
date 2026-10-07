"use client";

import { CalendarDays } from "lucide-react";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/format";
import { Calendar } from "./calendar";
import { Popover } from "./popover";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minDate?: string;
  id?: string;
  className?: string;
  invalid?: boolean;
}

export function DatePicker({ value, onChange, placeholder = "Selecionar data", minDate, id, className, invalid }: DatePickerProps) {
  return (
    <Popover
      className="w-72 p-3"
      trigger={({ open, toggle, ref }) => (
        <button
          ref={ref}
          id={id}
          type="button"
          onClick={toggle}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-invalid={invalid || undefined}
          className={cn(
            "flex h-9 w-full min-w-40 items-center gap-2 rounded-[10px] border border-line bg-white px-3 text-left text-sm shadow-[0_1px_2px_rgba(32,32,32,0.03)] transition-[border,box-shadow] hover:border-line-strong focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/12 aria-[invalid=true]:border-danger",
            open && "border-gold ring-4 ring-gold/12",
            className,
          )}
        >
          <CalendarDays className="size-4 text-subtle" aria-hidden />
          <span className={value ? "text-ink" : "text-subtle"}>{value ? formatDate(value) : placeholder}</span>
        </button>
      )}
    >
      {(close) => (
        <Calendar
          value={value || null}
          minDate={minDate}
          onChange={(d) => {
            onChange(d);
            close();
          }}
        />
      )}
    </Popover>
  );
}
