"use client";

import { addDays, format } from "date-fns";
import { CalendarDays, Mail, Pencil, Phone, Plus, Stethoscope, Trash2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { PeriodFilter } from "@/components/shared/period-filter";
import { SafeImage } from "@/components/shared/safe-image";
import { IMAGES } from "@/data/images";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Drawer } from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";
import { AppointmentStatusBadge } from "@/features/appointments/components/status-badge";
import { useAppointmentsRange } from "@/features/appointments/hooks";
import { rangeForPreset } from "@/features/reports/period";
import { useLookups } from "@/hooks/use-lookups";
import { toast } from "@/stores/toast-store";
import type { DateRange, PeriodPreset } from "@/types/common";
import { todayISO } from "@/utils/dates";
import { formatCurrency, formatCurrencyCompact, formatDate, formatPercent, formatPhone } from "@/utils/format";
import { useProfessionalPerformance, useProfessionals } from "../hooks";
import { professionalService, type ProfessionalPerformance } from "../service";
import { WEEKDAY_SHORT, type Professional } from "../types";
import { ProfessionalFormDialog } from "./professional-form-dialog";

function ProfessionalAgenda({ professional }: { professional: Professional }) {
  const lookups = useLookups();
  const from = todayISO();
  const to = format(addDays(new Date(), 13), "yyyy-MM-dd");
  const { data = [] } = useAppointmentsRange(from, to);
  const own = data.filter((a) => a.professionalId === professional.id && a.status !== "cancelada").sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`));
  const days = [...new Set(own.map((a) => a.date))];
  if (!own.length) return <EmptyState compact icon={<CalendarDays />} title="Sem consultas nos próximos 14 dias" />;
  return (
    <div className="space-y-4">
      {days.map((d) => (
        <div key={d}>
          <p className="mb-1.5 text-[12px] font-semibold cap-first text-muted">{formatDate(d, "EEEE, dd/MM")}</p>
          <ul className="divide-y divide-line rounded-[12px] border border-line">
            {own
              .filter((a) => a.date === d)
              .map((a) => (
                <li key={a.id} className="flex items-center gap-3 px-3 py-2.5">
                  <span className="w-12 text-[13px] font-semibold tabular">{a.start}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium">{a.patientName}</span>
                    <span className="block truncate text-[11.5px] text-subtle">{lookups.treatmentName(a.treatmentId)}</span>
                  </span>
                  <AppointmentStatusBadge status={a.status} />
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function ProfessionalsView() {
  const { data, loading } = useProfessionals();
  const lookups = useLookups();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [preset, setPreset] = useState<PeriodPreset>("30d");
  const [custom, setCustom] = useState<DateRange>(() => rangeForPreset("30d"));
  const range = useMemo(() => rangeForPreset(preset, custom), [preset, custom]);
  const { data: performance = [] } = useProfessionalPerformance(range);
  const [selectedId, setSelectedId] = useState<string | null>(() => params.get("id"));
  const [drawerTab, setDrawerTab] = useState<"perfil" | "agenda" | "producao">("perfil");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Professional | null>(null);
  const [toDelete, setToDelete] = useState<Professional | null>(null);

  useEffect(() => {
    if (params.get("id")) router.replace(pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = (data ?? []).find((p) => p.id === selectedId) ?? null;
  const selectedPerf = performance.find((p) => p.professional.id === selectedId);

  const columns: Column<ProfessionalPerformance>[] = [
    {
      key: "name",
      header: "Profissional",
      sortValue: (r) => r.professional.name,
      cell: (r) => (
        <div className="flex items-center gap-2.5">
          <span className="size-2 rounded-full" style={{ backgroundColor: r.professional.color }} />
          <span className="whitespace-nowrap font-medium">
            {r.professional.title} {r.professional.name}
          </span>
        </div>
      ),
    },
    { key: "proc", header: "Procedimentos", align: "right", sortValue: (r) => r.procedures, cell: (r) => <span className="tabular">{r.procedures}</span> },
    { key: "patients", header: "Pacientes", align: "right", sortValue: (r) => r.patients, cell: (r) => <span className="tabular">{r.patients}</span> },
    { key: "noshow", header: "Faltas", align: "right", sortValue: (r) => r.noShows, cell: (r) => <span className="tabular text-muted">{r.noShows}</span> },
    { key: "prod", header: "Produção", align: "right", sortValue: (r) => r.production, cell: (r) => <span className="font-semibold tabular">{formatCurrency(r.production)}</span> },
    {
      key: "comm",
      header: "Comissão",
      align: "right",
      sortValue: (r) => r.commission,
      cell: (r) => (
        <span className="tabular">
          {formatCurrency(r.commission)} <span className="text-subtle">({formatPercent(r.professional.commissionRate)})</span>
        </span>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Profissionais"
        description="Equipe clínica, horários, agenda individual e produção."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus /> Novo profissional
          </Button>
        }
      />

      {loading && !data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(data ?? []).map((p) => {
            const perf = performance.find((x) => x.professional.id === p.id);
            return (
              <li key={p.id} className="min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(p.id);
                    setDrawerTab("perfil");
                  }}
                  className="group flex h-full w-full flex-col rounded-[14px] border border-line bg-white p-5 text-left shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-soft)]"
                >
                  <div className="flex items-start gap-4">
                    <span className="relative size-16 shrink-0 overflow-hidden rounded-[12px] bg-sand">
                      <SafeImage src={p.photo || IMAGES.professionals[p.id] || IMAGES.fallback.avatar} alt={`${p.title} ${p.name}`} fill sizes="64px" className="object-cover object-top" fallback="avatar" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-semibold">
                        {p.title} {p.name}
                      </p>
                      <p className="truncate text-[12.5px] text-muted">{p.specialty}</p>
                      <p className="mt-0.5 text-[12px] text-subtle">{p.cro}</p>
                    </div>
                    <Badge tone={p.status === "ativo" ? "success" : "neutral"} dot>
                      {p.status === "ativo" ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1">
                    {WEEKDAY_SHORT.map((d, i) => (
                      <span
                        key={d}
                        className={p.workingHours.some((h) => h.weekday === i) ? "rounded-md bg-ink px-1.5 py-0.5 text-[10.5px] font-medium text-white" : "rounded-md bg-sand px-1.5 py-0.5 text-[10.5px] text-subtle"}
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto grid grid-cols-3 gap-2 border-t border-line pt-4 text-center">
                    <div>
                      <p className="text-[15px] font-semibold tabular">{perf?.procedures ?? 0}</p>
                      <p className="text-[11px] text-subtle">procedimentos</p>
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold tabular">{perf?.patients ?? 0}</p>
                      <p className="text-[11px] text-subtle">pacientes</p>
                    </div>
                    <div>
                      <p className="truncate text-[13px] font-semibold tabular sm:text-[15px]">{formatCurrencyCompact(perf?.production ?? 0)}</p>
                      <p className="text-[11px] text-subtle">produção</p>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <Card className="mt-6 overflow-hidden">
        <CardHeader title="Financeiro por profissional" description="Produção = parcelas recebidas atribuídas ao profissional no período." action={<PeriodFilter preset={preset} onPresetChange={setPreset} custom={custom} onCustomChange={setCustom} />} className="flex-col sm:flex-row" />
        <CardBody className="px-0 pb-0">
          <DataTable
            caption="Produção por profissional"
            rows={performance}
            columns={columns}
            getRowId={(r) => r.professional.id}
            onRowClick={(r) => {
              setSelectedId(r.professional.id);
              setDrawerTab("producao");
            }}
            initialSort={{ key: "prod", dir: "desc" }}
            mobileCard={(r) => (
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {r.professional.title} {r.professional.name}
                </span>
                <span className="text-right">
                  <span className="block font-semibold tabular">{formatCurrency(r.production)}</span>
                  <span className="text-[12px] text-subtle">comissão {formatCurrency(r.commission)}</span>
                </span>
              </div>
            )}
          />
        </CardBody>
      </Card>

      <Drawer
        open={!!selected}
        onClose={() => setSelectedId(null)}
        title={selected ? `${selected.title} ${selected.name}` : ""}
        description={selected?.specialty}
        width="sm:max-w-[520px]"
        footer={
          selected ? (
            <div className="flex gap-2">
              <Button
                className="flex-1"
                variant="secondary"
                onClick={() => {
                  setEditing(selected);
                  setFormOpen(true);
                }}
              >
                <Pencil /> Editar
              </Button>
              <Button variant="danger-ghost" onClick={() => setToDelete(selected)}>
                <Trash2 /> Excluir
              </Button>
            </div>
          ) : null
        }
      >
        {selected ? (
          <div className="px-5 py-4">
            <Tabs
              items={[
                { id: "perfil" as const, label: "Perfil" },
                { id: "agenda" as const, label: "Agenda" },
                { id: "producao" as const, label: "Produção" },
              ]}
              value={drawerTab}
              onChange={setDrawerTab}
              className="mb-5"
            />
            {drawerTab === "perfil" ? (
              <div className="space-y-5 text-[13.5px]">
                <p className="leading-relaxed text-ink-2">{selected.bio || "Sem biografia cadastrada."}</p>
                <div className="space-y-1.5">
                  <p className="flex items-center gap-2"><Stethoscope className="size-4 text-subtle" /> {selected.cro}</p>
                  <p className="flex items-center gap-2"><Phone className="size-4 text-subtle" /> {formatPhone(selected.phone)}</p>
                  <p className="flex items-center gap-2"><Mail className="size-4 text-subtle" /> {selected.email || "—"}</p>
                </div>
                <div>
                  <p className="mb-2 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-subtle">Horários</p>
                  <ul className="space-y-1">
                    {selected.workingHours.map((h) => (
                      <li key={h.weekday} className="flex justify-between rounded-md bg-ivory px-3 py-1.5 tabular">
                        <span>{WEEKDAY_SHORT[h.weekday]}</span>
                        <span className="text-muted">{h.start} – {h.end}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-2 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-subtle">Procedimentos</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.treatmentIds.map((id) => (
                      <Badge key={id}>{lookups.treatmentName(id)}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
            {drawerTab === "agenda" ? <ProfessionalAgenda professional={selected} /> : null}
            {drawerTab === "producao" ? (
              <div className="space-y-3">
                <p className="text-[12.5px] text-muted">
                  Período: {formatDate(range.from)} a {formatDate(range.to)}
                </p>
                <dl className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Procedimentos realizados", value: String(selectedPerf?.procedures ?? 0) },
                    { label: "Pacientes atendidos", value: String(selectedPerf?.patients ?? 0) },
                    { label: "Produção", value: formatCurrency(selectedPerf?.production ?? 0) },
                    { label: `Comissão (${formatPercent(selected.commissionRate)})`, value: formatCurrency(selectedPerf?.commission ?? 0) },
                  ].map((m) => (
                    <div key={m.label} className="rounded-[12px] border border-line p-3">
                      <dt className="text-[12px] text-muted">{m.label}</dt>
                      <dd className="mt-1 text-lg font-semibold tabular">{m.value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="text-[12px] leading-relaxed text-subtle">Comissão calculada sobre a produção recebida no período, conforme o percentual cadastrado.</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </Drawer>

      <ProfessionalFormDialog open={formOpen} onClose={() => setFormOpen(false)} professional={editing} />
      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Excluir profissional?"
        description="O profissional será removido da equipe e do site. Consultas já registradas permanecem no histórico. Considere apenas desativar."
        onConfirm={async () => {
          if (!toDelete) return;
          await professionalService.remove(toDelete.id);
          setSelectedId(null);
          toast.success("Profissional excluído");
        }}
      />
    </div>
  );
}
