"use client";

import { addDays, addMonths, endOfMonth, endOfWeek, format, parseISO, startOfMonth, startOfWeek, subDays, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarPlus, ChevronLeft, ChevronRight, Filter, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Select } from "@/components/ui/input";
import { Popover } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Segmented } from "@/components/ui/tabs";
import { useSettings } from "@/features/settings/hooks";
import { useLookups } from "@/hooks/use-lookups";
import { cn } from "@/utils/cn";
import { todayISO } from "@/utils/dates";
import { useAppointmentsRange } from "../hooks";
import { APPOINTMENT_STATUS, APPOINTMENT_STATUSES, type Appointment, type AppointmentFilters, type AppointmentView } from "../types";
import { AppointmentDrawer } from "./appointment-drawer";
import { AppointmentFormDialog, type AppointmentDefaults } from "./appointment-form-dialog";
import { MonthView } from "./month-view";
import { TimeGrid, type GridColumn } from "./time-grid";
import { TodayBoard } from "./today-board";

const VIEWS: { value: AppointmentView; label: string }[] = [
  { value: "hoje", label: "Hoje" },
  { value: "dia", label: "Dia" },
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mês" },
];

const EMPTY_FILTERS: AppointmentFilters = { professionalId: "", treatmentId: "", status: "", room: "" };

function rangeFor(view: AppointmentView, date: string) {
  const d = parseISO(date);
  if (view === "semana") return { from: format(startOfWeek(d, { weekStartsOn: 1 }), "yyyy-MM-dd"), to: format(endOfWeek(d, { weekStartsOn: 1 }), "yyyy-MM-dd") };
  if (view === "mes") return { from: format(startOfWeek(startOfMonth(d)), "yyyy-MM-dd"), to: format(endOfWeek(endOfMonth(d)), "yyyy-MM-dd") };
  return { from: date, to: date };
}

export function AgendaView() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const today = todayISO();
  const lookups = useLookups();
  const { data: settings } = useSettings();

  const [view, setView] = useState<AppointmentView>(() => (params.get("data") && params.get("data") !== today ? "dia" : (params.get("visao") as AppointmentView) || "hoje"));
  const [date, setDate] = useState(() => params.get("data") ?? today);
  const [filters, setFilters] = useState<AppointmentFilters>(EMPTY_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(() => params.get("consulta"));
  const [formOpen, setFormOpen] = useState(() => params.get("nova") === "1");
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [defaults, setDefaults] = useState<AppointmentDefaults | undefined>(undefined);

  const effectiveDate = view === "hoje" ? today : date;
  const range = rangeFor(view, effectiveDate);
  const { data: raw, loading } = useAppointmentsRange(range.from, range.to);

  // Limpa parâmetros de navegação após aplicá-los (deep links do dashboard e da busca).
  useEffect(() => {
    if (params.get("consulta") || params.get("nova") || params.get("data")) router.replace(pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const appointments = useMemo(
    () =>
      (raw ?? []).filter(
        (a) =>
          (!filters.professionalId || a.professionalId === filters.professionalId) &&
          (!filters.treatmentId || a.treatmentId === filters.treatmentId) &&
          (!filters.status || a.status === filters.status) &&
          (!filters.room || a.room === filters.room),
      ),
    [raw, filters],
  );

  const selected = useMemo(() => (raw ?? []).find((a) => a.id === selectedId) ?? null, [raw, selectedId]);
  const professionalsMap = useMemo(() => new Map(lookups.professionals.map((p) => [p.id, p])), [lookups.professionals]);
  const activeProfessionals = lookups.professionals.filter((p) => p.status === "ativo");
  const activeFilters = Object.values(filters).filter(Boolean).length;

  const navigate = (dir: -1 | 1) => {
    const d = parseISO(effectiveDate);
    const next =
      view === "mes" ? (dir > 0 ? addMonths(d, 1) : subMonths(d, 1)) : view === "semana" ? addDays(d, dir * 7) : dir > 0 ? addDays(d, 1) : subDays(d, 1);
    if (view === "hoje") setView("dia");
    setDate(format(next, "yyyy-MM-dd"));
  };

  const openCreate = useCallback((d?: AppointmentDefaults) => {
    setEditing(null);
    setDefaults(d);
    setFormOpen(true);
  }, []);

  const title = (() => {
    const d = parseISO(effectiveDate);
    if (view === "mes") return format(d, "MMMM 'de' yyyy", { locale: ptBR });
    if (view === "semana") {
      const r = rangeFor("semana", effectiveDate);
      return `${format(parseISO(r.from), "d MMM", { locale: ptBR })} – ${format(parseISO(r.to), "d MMM yyyy", { locale: ptBR })}`;
    }
    return format(d, "EEEE, d 'de' MMMM", { locale: ptBR });
  })();

  const columns: GridColumn[] = useMemo(() => {
    if (view === "semana") {
      const start = parseISO(rangeFor("semana", effectiveDate).from);
      return Array.from({ length: 6 }, (_, i) => {
        const d = addDays(start, i);
        const iso = format(d, "yyyy-MM-dd");
        return {
          id: iso,
          date: iso,
          label: format(d, "EEE dd", { locale: ptBR }).replace(/^\w/, (c) => c.toUpperCase()),
          sublabel: `${appointments.filter((a) => a.date === iso && a.status !== "cancelada").length} consultas`,
          highlight: iso === today,
          professionalId: undefined,
        };
      });
    }
    const profs = filters.professionalId ? activeProfessionals.filter((p) => p.id === filters.professionalId) : activeProfessionals;
    return profs.map((p) => ({ id: p.id, date: effectiveDate, label: `${p.title} ${p.name}`, sublabel: p.specialty, professionalId: p.id }));
  }, [view, effectiveDate, appointments, activeProfessionals, filters.professionalId, today]);

  const counts = useMemo(() => {
    const active = appointments.filter((a) => a.status !== "cancelada" && a.status !== "faltou");
    return { total: active.length, confirmed: active.filter((a) => a.status === "confirmada").length };
  }, [appointments]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Agenda"
        description="Consultas, encaixes e fluxo de atendimento da clínica."
        actions={
          <Button onClick={() => openCreate({ date: effectiveDate })}>
            <CalendarPlus /> Nova consulta
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line p-3 sm:p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Segmented label="Visualização" options={VIEWS} value={view} onChange={(v) => setView(v)} />
            {view !== "hoje" ? (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon-sm" onClick={() => navigate(-1)} aria-label="Período anterior">
                  <ChevronLeft />
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setDate(today)}>
                  Hoje
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => navigate(1)} aria-label="Próximo período">
                  <ChevronRight />
                </Button>
              </div>
            ) : null}
            <h2 className="ml-1 text-[15px] font-semibold cap-first text-ink">{view === "hoje" ? `Hoje · ${title}` : title}</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12.5px] text-muted">
              <strong className="font-semibold tabular text-ink">{counts.total}</strong> consultas ·{" "}
              <strong className="font-semibold tabular text-ink">{counts.confirmed}</strong> confirmadas
            </span>
            <Popover
              align="end"
              className="w-[min(320px,calc(100vw-32px))] p-4"
              trigger={({ open, toggle, ref }) => (
                <Button ref={ref} variant="secondary" size="sm" onClick={toggle} aria-expanded={open}>
                  <Filter /> Filtros
                  {activeFilters ? <span className="rounded-full bg-ink px-1.5 text-[10.5px] text-white">{activeFilters}</span> : null}
                </Button>
              )}
            >
              {() => (
                <div className="space-y-3">
                  <Field label="Dentista" htmlFor="f-prof">
                    <Select id="f-prof" value={filters.professionalId} onChange={(e) => setFilters((f) => ({ ...f, professionalId: e.target.value }))}>
                      <option value="">Todos</option>
                      {activeProfessionals.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} {p.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Procedimento" htmlFor="f-trt">
                    <Select id="f-trt" value={filters.treatmentId} onChange={(e) => setFilters((f) => ({ ...f, treatmentId: e.target.value }))}>
                      <option value="">Todos</option>
                      {lookups.treatments.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Status" htmlFor="f-status">
                      <Select id="f-status" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as AppointmentFilters["status"] }))}>
                        <option value="">Todos</option>
                        {APPOINTMENT_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {APPOINTMENT_STATUS[s].label}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Sala" htmlFor="f-room">
                      <Select id="f-room" value={filters.room} onChange={(e) => setFilters((f) => ({ ...f, room: e.target.value }))}>
                        <option value="">Todas</option>
                        {(settings?.agenda.rooms ?? []).map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  </div>
                  {activeFilters ? (
                    <Button variant="ghost" size="sm" className="w-full" onClick={() => setFilters(EMPTY_FILTERS)}>
                      <X /> Limpar filtros
                    </Button>
                  ) : null}
                </div>
              )}
            </Popover>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 border-b border-line bg-ivory/50 px-3 py-2 sm:px-4">
          {activeProfessionals.map((p) => {
            const on = filters.professionalId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setFilters((f) => ({ ...f, professionalId: on ? "" : p.id }))}
                aria-pressed={on}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium transition-colors",
                  on ? "border-ink bg-ink text-white" : "border-line bg-white text-ink-2 hover:border-line-strong",
                )}
              >
                <span className="size-2 rounded-full" style={{ backgroundColor: p.color }} />
                {p.title} {p.name.split(" ")[0]}
              </button>
            );
          })}
        </div>

        {loading && !raw ? (
          <div className="space-y-3 p-5">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-[420px] w-full" />
          </div>
        ) : view === "hoje" ? (
          <TodayBoard
            appointments={appointments}
            professionalColor={(id) => professionalsMap.get(id)?.color ?? "#B69A67"}
            professionalName={lookups.professionalName}
            treatmentName={lookups.treatmentName}
            onSelect={(a) => setSelectedId(a.id)}
          />
        ) : view === "mes" ? (
          <MonthView
            date={effectiveDate}
            appointments={appointments}
            professionals={professionalsMap}
            today={today}
            onSelectDay={(d) => {
              setDate(d);
              setView("dia");
            }}
            onSelect={(a) => setSelectedId(a.id)}
          />
        ) : (
          <div className="scrollbar-thin max-h-[calc(100dvh-300px)] min-h-[480px] overflow-y-auto">
            <TimeGrid
              columns={columns}
              appointments={appointments}
              openTime={settings?.agenda.openTime ?? "08:00"}
              closeTime={settings?.agenda.closeTime ?? "19:00"}
              professionals={professionalsMap}
              treatmentName={lookups.treatmentName}
              onSelect={(a) => setSelectedId(a.id)}
              onCreate={(d, start, professionalId) => openCreate({ date: d, start, professionalId })}
              today={today}
            />
          </div>
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
      <AppointmentFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        appointment={editing}
        defaults={defaults}
        onSaved={(a) => {
          if (view !== "hoje" || a.date !== today) {
            setDate(a.date);
            if (view === "hoje") setView("dia");
          }
        }}
      />
    </div>
  );
}
