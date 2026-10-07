"use client";

import { addDays, format, subDays } from "date-fns";
import { CalendarCheck2, CalendarDays, Download, Globe, MonitorSmartphone, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { WhatsappIcon } from "@/components/shared/social-icons";
import { Badge } from "@/components/ui/badge";
import { buttonVariants, Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Select } from "@/components/ui/input";
import { SkeletonRows } from "@/components/ui/skeleton";
import { Segmented } from "@/components/ui/tabs";
import { useDebounce } from "@/hooks/use-debounce";
import { useLookups } from "@/hooks/use-lookups";
import { toast } from "@/stores/toast-store";
import { clinicNow } from "@/utils/dates";
import { formatDate, formatPhone, formatRelative, matchesSearch } from "@/utils/format";
import { whatsappLink } from "@/utils/whatsapp";
import { useAppointments } from "../hooks";
import { appointmentService } from "../service";
import { APPOINTMENT_STATUS, APPOINTMENT_STATUSES, type Appointment, type AppointmentStatus } from "../types";
import { AppointmentDrawer } from "./appointment-drawer";
import { AppointmentFormDialog } from "./appointment-form-dialog";

type Origin = "todos" | Appointment["source"];
type Period = "proximos" | "hoje" | "ultimos30" | "todos";

const ORIGIN: Record<Appointment["source"], { label: string; tone: "gold" | "neutral" | "success"; icon: React.ReactNode }> = {
  online: { label: "Site", tone: "gold", icon: <Globe className="size-3" /> },
  painel: { label: "Painel", tone: "neutral", icon: <MonitorSmartphone className="size-3" /> },
  whatsapp: { label: "WhatsApp", tone: "success", icon: <WhatsappIcon className="size-3" /> },
};

function StatusSelect({ appointment }: { appointment: Appointment }) {
  const [busy, setBusy] = useState(false);
  return (
    <Select
      aria-label={`Status do agendamento de ${appointment.patientName}`}
      value={appointment.status}
      disabled={busy}
      className="h-8 min-w-[150px] text-[12.5px]"
      onClick={(e) => e.stopPropagation()}
      onChange={async (e) => {
        const status = e.target.value as AppointmentStatus;
        setBusy(true);
        try {
          await appointmentService.setStatus(appointment.id, status);
          toast.success("Status atualizado", `${appointment.patientName} · ${APPOINTMENT_STATUS[status].label}`);
        } catch (err) {
          toast.error("Não foi possível atualizar", err instanceof Error ? err.message : undefined);
        } finally {
          setBusy(false);
        }
      }}
    >
      {APPOINTMENT_STATUSES.map((s) => (
        <option key={s} value={s}>
          {APPOINTMENT_STATUS[s].label}
        </option>
      ))}
    </Select>
  );
}

/**
 * Lista única de agendamentos: os feitos pelo site (/agendar) chegam aqui
 * direto do banco compartilhado, junto com os criados no painel.
 */
export function BookingsView() {
  const lookups = useLookups();
  const { data, loading } = useAppointments();
  const [query, setQuery] = useState("");
  const [origin, setOrigin] = useState<Origin>("todos");
  const [period, setPeriod] = useState<Period>("proximos");
  const [status, setStatus] = useState<AppointmentStatus | "">("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const search = useDebounce(query, 120);
  const today = clinicNow().date;

  const all = useMemo(() => data ?? [], [data]);
  const inPeriod = useMemo(() => {
    const from30 = format(subDays(new Date(`${today}T12:00:00`), 30), "yyyy-MM-dd");
    return all.filter((a) => {
      if (period === "hoje") return a.date === today;
      if (period === "proximos") return a.date >= today;
      if (period === "ultimos30") return a.date >= from30 && a.date <= today;
      return true;
    });
  }, [all, period, today]);

  const counts = useMemo(() => {
    const c: Record<Origin, number> = { todos: 0, online: 0, painel: 0, whatsapp: 0 };
    inPeriod.forEach((a) => {
      c.todos += 1;
      c[a.source] += 1;
    });
    return c;
  }, [inPeriod]);

  const rows = useMemo(
    () =>
      inPeriod
        .filter(
          (a) =>
            (origin === "todos" || a.source === origin) &&
            (!status || a.status === status) &&
            matchesSearch(search, a.patientName, a.patientPhone, lookups.treatmentName(a.treatmentId), lookups.professionalName(a.professionalId)),
        )
        .sort((a, b) => (period === "ultimos30" ? `${b.date}${b.start}`.localeCompare(`${a.date}${a.start}`) : `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`))),
    [inPeriod, origin, status, search, lookups, period],
  );

  const kpis = useMemo(() => {
    const week = format(addDays(new Date(`${today}T12:00:00`), 7), "yyyy-MM-dd");
    const upcoming = all.filter((a) => a.date >= today && a.status !== "cancelada" && a.status !== "faltou");
    return [
      { label: "Hoje", value: upcoming.filter((a) => a.date === today).length, icon: <CalendarDays /> },
      { label: "Próximos 7 dias", value: upcoming.filter((a) => a.date <= week).length, icon: <CalendarCheck2 /> },
      { label: "Pelo site (próximos)", value: upcoming.filter((a) => a.source === "online").length, icon: <Globe /> },
      { label: "A confirmar", value: upcoming.filter((a) => a.status === "agendada" || a.status === "aguardando").length, icon: <CalendarDays /> },
    ];
  }, [all, today]);

  const selected = all.find((a) => a.id === selectedId) ?? null;

  const exportCsv = () => {
    const header = ["Data", "Horário", "Paciente", "Telefone", "Tratamento", "Profissional", "Origem", "Status", "Criado em"];
    const lines = rows.map((a) =>
      [formatDate(a.date), a.start, a.patientName, formatPhone(a.patientPhone), lookups.treatmentName(a.treatmentId), lookups.professionalName(a.professionalId), ORIGIN[a.source].label, APPOINTMENT_STATUS[a.status].label, formatDate(a.createdAt, "dd/MM/yyyy HH:mm")]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(";"),
    );
    const blob = new Blob([`﻿${[header.join(";"), ...lines].join("\n")}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "agendamentos-oralclin.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns: Column<Appointment>[] = [
    {
      key: "when",
      header: "Data e horário",
      sortValue: (a) => `${a.date}${a.start}`,
      cell: (a) => (
        <div className="whitespace-nowrap">
          <p className="cap-first font-medium tabular text-ink">{formatDate(a.date, "EEE, dd/MM")}</p>
          <p className="text-[12px] tabular text-subtle">
            {a.start} · {a.duration} min
          </p>
        </div>
      ),
    },
    {
      key: "patient",
      header: "Paciente",
      sortValue: (a) => a.patientName,
      cell: (a) => (
        <div className="min-w-[170px]">
          <p className="truncate font-medium text-ink">{a.patientName}</p>
          <p className="truncate text-[12px] tabular text-subtle">{formatPhone(a.patientPhone)}</p>
        </div>
      ),
    },
    { key: "treatment", header: "Tratamento", cell: (a) => <span className="block max-w-[180px] truncate text-ink-2">{lookups.treatmentName(a.treatmentId)}</span> },
    { key: "professional", header: "Profissional", cell: (a) => <span className="whitespace-nowrap text-ink-2">{lookups.professionalName(a.professionalId)}</span> },
    {
      key: "origin",
      header: "Origem",
      sortValue: (a) => a.source,
      cell: (a) => (
        <div className="whitespace-nowrap">
          <Badge tone={ORIGIN[a.source].tone}>
            <span className="inline-flex items-center gap-1">
              {ORIGIN[a.source].icon} {ORIGIN[a.source].label}
            </span>
          </Badge>
          <p className="mt-1 text-[11.5px] text-subtle">{formatRelative(a.createdAt)}</p>
        </div>
      ),
    },
    { key: "status", header: "Status", sortValue: (a) => a.status, cell: (a) => <StatusSelect appointment={a} /> },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (a) => (
        <a
          href={whatsappLink(a.patientPhone, `Olá, ${a.patientName.split(" ")[0]}! Aqui é da Oralclin, sobre sua consulta de ${formatDate(a.date, "dd/MM")} às ${a.start}.`)}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          aria-label={`Conversar com ${a.patientName} no WhatsApp`}
          className="inline-flex size-8 items-center justify-center rounded-[10px] text-success transition-colors hover:bg-success-soft"
        >
          <WhatsappIcon className="size-4" />
        </a>
      ),
    },
  ];

  const origins: { value: Origin; label: string }[] = [
    { value: "todos", label: `Todos ${counts.todos}` },
    { value: "online", label: `Site ${counts.online}` },
    { value: "painel", label: `Painel ${counts.painel}` },
    { value: "whatsapp", label: `WhatsApp ${counts.whatsapp}` },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Agendamentos"
        description="Agendamentos feitos pelo site e pelo painel, atualizados automaticamente."
        actions={
          <>
            <Button variant="secondary" onClick={exportCsv} disabled={!rows.length}>
              <Download /> Exportar
            </Button>
            <Link href="/admin/agenda" className={buttonVariants({})}>
              <CalendarDays /> Abrir agenda
            </Link>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="flex items-center gap-3 p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold-dark [&_svg]:size-4">{k.icon}</span>
            <div className="min-w-0">
              <p className="truncate text-[12px] text-subtle">{k.label}</p>
              <p className="text-xl font-semibold tabular">{k.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line p-3 sm:p-4 xl:flex-row xl:items-center">
          <div className="w-full xl:max-w-xs">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar paciente, telefone, tratamento" leading={<Search />} aria-label="Buscar agendamentos" />
          </div>
          <div className="scrollbar-thin -mx-1 overflow-x-auto px-1">
            <Segmented label="Filtrar por origem" size="sm" options={origins} value={origin} onChange={setOrigin} />
          </div>
          <div className="grid grid-cols-2 gap-3 xl:ml-auto xl:w-[400px]">
            <Select value={period} onChange={(e) => setPeriod(e.target.value as Period)} aria-label="Período">
              <option value="proximos">Próximos</option>
              <option value="hoje">Hoje</option>
              <option value="ultimos30">Últimos 30 dias</option>
              <option value="todos">Todos</option>
            </Select>
            <Select value={status} onChange={(e) => setStatus(e.target.value as AppointmentStatus | "")} aria-label="Status">
              <option value="">Todos os status</option>
              {APPOINTMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {APPOINTMENT_STATUS[s].label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {loading && !data ? (
          <div className="p-5">
            <SkeletonRows rows={8} />
          </div>
        ) : (
          <DataTable
            caption="Lista de agendamentos"
            rows={rows}
            columns={columns}
            getRowId={(a) => a.id}
            onRowClick={(a) => setSelectedId(a.id)}
            pageSize={15}
            mobileCard={(a) => (
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-medium">{a.patientName}</p>
                    <p className="cap-first text-[12px] tabular text-subtle">
                      {formatDate(a.date, "EEE, dd/MM")} · {a.start} · {lookups.treatmentName(a.treatmentId)}
                    </p>
                  </div>
                  <Badge tone={ORIGIN[a.source].tone}>{ORIGIN[a.source].label}</Badge>
                </div>
                <StatusSelect appointment={a} />
              </div>
            )}
            empty={
              <EmptyState
                icon={<CalendarCheck2 />}
                title="Nenhum agendamento encontrado"
                description="Ajuste os filtros. Novos agendamentos feitos no site aparecem aqui automaticamente."
                compact
              />
            }
          />
        )}
      </Card>

      <AppointmentDrawer
        appointment={selected}
        onClose={() => setSelectedId(null)}
        onEdit={(a) => {
          setSelectedId(null);
          setEditing(a);
          setFormOpen(true);
        }}
      />
      <AppointmentFormDialog open={formOpen} onClose={() => setFormOpen(false)} appointment={editing} />
    </div>
  );
}
