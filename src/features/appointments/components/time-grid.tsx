"use client";

import { useEffect, useRef, useState } from "react";
import type { Professional } from "@/features/professionals/types";
import { cn } from "@/utils/cn";
import { endTime, minutesToTime, timeToMinutes } from "@/utils/dates";
import type { Appointment } from "../types";

export interface GridColumn {
  id: string;
  label: string;
  sublabel?: string;
  date: string;
  professionalId?: string;
  highlight?: boolean;
}

interface TimeGridProps {
  columns: GridColumn[];
  appointments: Appointment[];
  openTime: string;
  closeTime: string;
  professionals: Map<string, Professional>;
  treatmentName: (id: string) => string;
  onSelect: (appointment: Appointment) => void;
  onCreate: (date: string, start: string, professionalId?: string) => void;
  today: string;
}

const HOUR = 64;

/** Distribui consultas sobrepostas em colunas lado a lado (layout de calendário). */
function layoutOverlaps(items: Appointment[]) {
  const sorted = [...items].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start) || b.duration - a.duration);
  const result = new Map<string, { lane: number; lanes: number }>();
  let cluster: { a: Appointment; lane: number }[] = [];
  let clusterEnd = -1;
  let laneEnds: number[] = [];
  const flush = () => {
    const lanes = Math.max(1, laneEnds.length);
    cluster.forEach(({ a, lane }) => result.set(a.id, { lane, lanes }));
    cluster = [];
    laneEnds = [];
  };
  for (const a of sorted) {
    const start = timeToMinutes(a.start);
    const end = start + a.duration;
    if (cluster.length && start >= clusterEnd) flush();
    let lane = laneEnds.findIndex((e) => e <= start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(end);
    } else laneEnds[lane] = end;
    cluster.push({ a, lane });
    clusterEnd = Math.max(cluster.length === 1 ? end : clusterEnd, end);
  }
  flush();
  return result;
}

export function TimeGrid({ columns, appointments, openTime, closeTime, professionals, treatmentName, onSelect, onCreate, today }: TimeGridProps) {
  const start = Math.floor(timeToMinutes(openTime) / 60) * 60;
  const end = Math.ceil(timeToMinutes(closeTime) / 60) * 60;
  const hours = Array.from({ length: (end - start) / 60 }, (_, i) => start + i * 60);
  const height = ((end - start) / 60) * HOUR;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [nowMinutes, setNowMinutes] = useState<number | null>(null);

  useEffect(() => {
    const update = () => {
      const d = new Date();
      setNowMinutes(d.getHours() * 60 + d.getMinutes());
    };
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const columnAppointments = (col: GridColumn) =>
    appointments.filter((a) => a.date === col.date && (!col.professionalId || a.professionalId === col.professionalId));

  return (
    <div ref={scrollRef} className="scrollbar-thin overflow-x-auto">
      <div style={{ minWidth: Math.max(560, columns.length * 150 + 56) }}>
        <div className="sticky top-0 z-10 flex border-b border-line bg-white">
          <div className="w-14 shrink-0" />
          {columns.map((c) => (
            <div key={c.id} className="flex-1 border-l border-line px-3 py-2.5">
              <p className={cn("truncate text-[13px] font-semibold", c.highlight ? "text-gold-dark" : "text-ink")}>{c.label}</p>
              {c.sublabel ? <p className="truncate text-[11.5px] text-subtle">{c.sublabel}</p> : null}
            </div>
          ))}
        </div>
        <div className="relative flex pt-3">
          <div className="w-14 shrink-0">
            {hours.map((h) => (
              <div key={h} style={{ height: HOUR }} className="relative">
                <span className="absolute -top-2 right-2 text-[11px] tabular text-subtle">{minutesToTime(h)}</span>
              </div>
            ))}
          </div>
          {columns.map((col) => (
            <div
              key={col.id}
              className={cn("relative flex-1 border-l border-line", col.date === today && columns.length > 1 && !col.professionalId && "bg-gold-soft/25")}
              style={{ height }}
            >
              {hours.map((h) => (
                <button
                  key={h}
                  type="button"
                  aria-label={`Criar consulta às ${minutesToTime(h)} — ${col.label}`}
                  onClick={(e) => {
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    const offset = e.clientY - rect.top;
                    const minutes = h + Math.floor((offset / HOUR) * 4) * 15;
                    onCreate(col.date, minutesToTime(minutes), col.professionalId);
                  }}
                  style={{ height: HOUR }}
                  className="block w-full border-b border-line/70 transition-colors hover:bg-sand/50 focus-visible:bg-sand/60 focus-visible:outline-none"
                >
                  <span className="block h-1/2 border-b border-dashed border-line/50" />
                </button>
              ))}

              {col.date === today && nowMinutes !== null && nowMinutes >= start && nowMinutes <= end ? (
                <div className="pointer-events-none absolute inset-x-0 z-20" style={{ top: ((nowMinutes - start) / 60) * HOUR }}>
                  <div className="relative h-px bg-danger/70">
                    <span className="absolute -left-1 -top-1 size-2 rounded-full bg-danger" />
                  </div>
                </div>
              ) : null}

              {(() => {
                const items = columnAppointments(col);
                const layout = layoutOverlaps(items);
                return items.map((a) => {
                const pos = layout.get(a.id) ?? { lane: 0, lanes: 1 };
                const top = ((timeToMinutes(a.start) - start) / 60) * HOUR;
                const h = Math.max(26, (a.duration / 60) * HOUR - 3);
                const color = professionals.get(a.professionalId)?.color ?? "#B69A67";
                const inactive = a.status === "cancelada" || a.status === "faltou";
                const compact = h < 48 || pos.lanes > 2;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => onSelect(a)}
                    className={cn(
                      "absolute z-10 overflow-hidden rounded-[8px] border-l-[3px] px-2 py-1 text-left shadow-[0_1px_2px_rgba(32,32,32,0.06)] transition-[transform,box-shadow] duration-150 hover:z-30 hover:-translate-y-px hover:shadow-[var(--shadow-soft)] focus-visible:z-30",
                      inactive && "opacity-55",
                      a.status === "finalizada" && "saturate-50",
                    )}
                    style={{
                      top: top + 1,
                      height: h,
                      left: `calc(${(pos.lane / pos.lanes) * 100}% + 3px)`,
                      width: `calc(${100 / pos.lanes}% - 6px)`,
                      borderLeftColor: color,
                      backgroundColor: `color-mix(in srgb, ${color} 12%, white)`,
                    }}
                    aria-label={`${a.start} ${a.patientName} — ${treatmentName(a.treatmentId)}`}
                  >
                    <p className={cn("truncate text-[11.5px] font-semibold text-ink", inactive && "line-through")}>
                      {pos.lanes > 2 ? a.patientName.split(" ")[0] : compact ? `${a.start} · ${a.patientName}` : a.patientName}
                    </p>
                    {!compact ? (
                      <>
                        <p className="truncate text-[11px] text-ink-2/80">{treatmentName(a.treatmentId)}</p>
                        <p className="truncate text-[10.5px] tabular text-subtle">
                          {a.start}–{endTime(a.start, a.duration)}
                        </p>
                      </>
                    ) : null}
                  </button>
                );
                });
              })()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
