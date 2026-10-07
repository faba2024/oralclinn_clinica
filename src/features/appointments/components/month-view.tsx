"use client";

import { eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, parseISO, startOfMonth, startOfWeek } from "date-fns";
import type { Professional } from "@/features/professionals/types";
import { cn } from "@/utils/cn";
import type { Appointment } from "../types";

interface MonthViewProps {
  date: string;
  appointments: Appointment[];
  professionals: Map<string, Professional>;
  today: string;
  onSelectDay: (date: string) => void;
  onSelect: (appointment: Appointment) => void;
}

const WEEK = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function MonthView({ date, appointments, professionals, today, onSelectDay, onSelect }: MonthViewProps) {
  const month = parseISO(date);
  const days = eachDayOfInterval({ start: startOfWeek(startOfMonth(month)), end: endOfWeek(endOfMonth(month)) });

  return (
    <div className="scrollbar-thin overflow-x-auto">
      <div className="min-w-[720px]">
        <div className="grid grid-cols-7 border-b border-line">
          {WEEK.map((d) => (
            <div key={d} className="px-3 py-2 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-subtle">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const iso = format(day, "yyyy-MM-dd");
            const list = appointments.filter((a) => a.date === iso).sort((a, b) => a.start.localeCompare(b.start));
            const outside = !isSameMonth(day, month);
            return (
              <div
                key={iso}
                className={cn("min-h-[116px] border-b border-r border-line p-1.5 [&:nth-child(7n)]:border-r-0", outside && "bg-ivory/70")}
              >
                <button
                  type="button"
                  onClick={() => onSelectDay(iso)}
                  className={cn(
                    "mb-1 flex size-7 items-center justify-center rounded-full text-[12.5px] tabular transition-colors hover:bg-sand",
                    iso === today ? "bg-ink font-semibold text-white hover:bg-ink" : outside ? "text-line-strong" : "text-ink",
                  )}
                  aria-label={`Abrir ${format(day, "dd/MM")}`}
                >
                  {format(day, "d")}
                </button>
                <ul className="space-y-0.5">
                  {list.slice(0, 3).map((a) => (
                    <li key={a.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(a)}
                        className={cn(
                          "flex w-full items-center gap-1.5 truncate rounded-md px-1.5 py-0.5 text-left text-[11px] transition-colors hover:bg-sand",
                          (a.status === "cancelada" || a.status === "faltou") && "line-through opacity-50",
                        )}
                      >
                        <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: professionals.get(a.professionalId)?.color }} />
                        <span className="tabular text-subtle">{a.start}</span>
                        <span className="truncate text-ink-2">{a.patientName.split(" ")[0]}</span>
                      </button>
                    </li>
                  ))}
                  {list.length > 3 ? (
                    <li>
                      <button type="button" onClick={() => onSelectDay(iso)} className="px-1.5 text-[11px] font-medium text-gold-dark hover:underline">
                        +{list.length - 3} consultas
                      </button>
                    </li>
                  ) : null}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
