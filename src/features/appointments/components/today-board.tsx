"use client";

import { ArrowRight, CheckCheck, Play, UserCheck } from "lucide-react";
import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/stores/toast-store";
import { cn } from "@/utils/cn";
import { endTime } from "@/utils/dates";
import { appointmentService } from "../service";
import type { Appointment, AppointmentStatus } from "../types";
import { AppointmentStatusBadge } from "./status-badge";

interface Lane {
  id: string;
  title: string;
  statuses: AppointmentStatus[];
  action?: { status: AppointmentStatus; label: string; icon: ReactNode };
}

const LANES: Lane[] = [
  { id: "chegar", title: "A chegar", statuses: ["agendada", "aguardando", "confirmada"], action: { status: "chegou", label: "Chegou", icon: <UserCheck /> } },
  { id: "recepcao", title: "Na recepção", statuses: ["chegou"], action: { status: "em-atendimento", label: "Iniciar", icon: <Play /> } },
  { id: "atendimento", title: "Em atendimento", statuses: ["em-atendimento"], action: { status: "finalizada", label: "Finalizar", icon: <CheckCheck /> } },
  { id: "finalizadas", title: "Finalizadas", statuses: ["finalizada"] },
];

interface TodayBoardProps {
  appointments: Appointment[];
  professionalColor: (id: string) => string;
  professionalName: (id: string) => string;
  treatmentName: (id: string) => string;
  onSelect: (appointment: Appointment) => void;
}

/** Visão operacional do dia: fluxo do paciente da chegada à finalização. */
export function TodayBoard({ appointments, professionalColor, professionalName, treatmentName, onSelect }: TodayBoardProps) {
  const absent = appointments.filter((a) => a.status === "cancelada" || a.status === "faltou");

  if (appointments.length === 0) {
    return <EmptyState title="Nenhuma consulta hoje" description="Use “Nova consulta” para agendar um horário." />;
  }

  return (
    <div className="p-3 sm:p-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {LANES.map((lane) => {
          const items = appointments.filter((a) => lane.statuses.includes(a.status)).sort((a, b) => a.start.localeCompare(b.start));
          return (
            <section key={lane.id} aria-label={lane.title} className="rounded-[12px] bg-ivory p-2.5 ring-1 ring-line">
              <header className="mb-2 flex items-center justify-between px-1">
                <h3 className="text-[12.5px] font-semibold text-ink-2">{lane.title}</h3>
                <span className="rounded-full bg-white px-2 text-[11px] font-semibold tabular text-muted ring-1 ring-line">{items.length}</span>
              </header>
              <ul className="space-y-2">
                {items.length === 0 ? <li className="rounded-[10px] border border-dashed border-line px-3 py-5 text-center text-[12px] text-subtle">Sem pacientes</li> : null}
                {items.map((a) => (
                  <li key={a.id} className="rounded-[10px] border border-line bg-white p-3 shadow-[0_1px_2px_rgba(32,32,32,0.04)]">
                    <button type="button" onClick={() => onSelect(a)} className="flex w-full items-start gap-2.5 text-left">
                      <Avatar name={a.patientName} size="sm" color={professionalColor(a.professionalId)} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-semibold">{a.patientName}</span>
                        <span className="block truncate text-[11.5px] text-subtle">
                          {a.start}–{endTime(a.start, a.duration)} · {treatmentName(a.treatmentId)}
                        </span>
                        <span className="block truncate text-[11.5px] text-subtle">{professionalName(a.professionalId)}</span>
                      </span>
                    </button>
                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <AppointmentStatusBadge status={a.status} />
                      {lane.action ? (
                        <Button
                          size="xs"
                          variant={lane.id === "chegar" && a.status !== "confirmada" ? "secondary" : "primary"}
                          onClick={async () => {
                            const target = lane.id === "chegar" && a.status !== "confirmada" ? "confirmada" : lane.action!.status;
                            await appointmentService.setStatus(a.id, target);
                            toast.success(target === "confirmada" ? "Consulta confirmada" : "Status atualizado", a.patientName);
                          }}
                        >
                          {lane.id === "chegar" && a.status !== "confirmada" ? (
                            <>
                              Confirmar <ArrowRight />
                            </>
                          ) : (
                            <>
                              {lane.action.icon} {lane.action.label}
                            </>
                          )}
                        </Button>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
      {absent.length ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-[10px] border border-line bg-white px-3 py-2.5 text-[12.5px]">
          <span className="font-medium text-muted">Cancelamentos e faltas:</span>
          {absent.map((a) => (
            <button key={a.id} type="button" onClick={() => onSelect(a)} className={cn("rounded-full bg-danger-soft px-2 py-0.5 text-danger hover:underline")}>
              {a.start} · {a.patientName.split(" ")[0]}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
