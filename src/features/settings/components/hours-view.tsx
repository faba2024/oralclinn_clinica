"use client";

import { ArrowUpRight, Globe, Save } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/checkbox";
import { Field, Input, Select } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfessionals } from "@/features/professionals/hooks";
import { professionalService } from "@/features/professionals/service";
import { professionalDisplayName, WEEKDAY_SHORT, type Professional, type WorkingHours } from "@/features/professionals/types";
import { toast } from "@/stores/toast-store";
import { cn } from "@/utils/cn";
import { useSettings } from "../hooks";
import { settingsService } from "../service";
import type { ClinicSettings } from "../types";

type Agenda = ClinicSettings["agenda"];

function ClinicHoursCard({ settings }: { settings: ClinicSettings }) {
  const [draft, setDraft] = useState<Agenda>(settings.agenda);
  const [saving, setSaving] = useState(false);

  useEffect(() => setDraft(settings.agenda), [settings.agenda]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(settings.agenda);
  const invalid = draft.openTime >= draft.closeTime;

  const save = async () => {
    if (invalid) return toast.error("Horário inválido", "O fechamento deve ser depois da abertura.");
    setSaving(true);
    try {
      await settingsService.patchSection("agenda", draft);
      toast.success("Horários da clínica salvos", "O agendamento online já usa as novas regras.");
    } catch (e) {
      toast.error("Não foi possível salvar", e instanceof Error ? e.message : undefined);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Expediente da clínica"
        description="Dias e horários em que a agenda e o agendamento online ficam disponíveis."
        action={
          <Button size="sm" onClick={save} loading={saving} disabled={!dirty}>
            <Save /> Salvar
          </Button>
        }
      />
      <CardBody className="space-y-5">
        <div>
          <p className="mb-2 text-[12.5px] font-medium text-ink-2">Dias de atendimento</p>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Dias de atendimento">
            {WEEKDAY_SHORT.map((label, i) => {
              const on = draft.workingDays.includes(i);
              return (
                <button
                  key={label}
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    setDraft({ ...draft, workingDays: on ? draft.workingDays.filter((d) => d !== i) : [...draft.workingDays, i].sort((a, b) => a - b) })
                  }
                  className={cn(
                    "h-9 min-w-12 rounded-[10px] border px-3 text-[13px] font-medium transition-colors",
                    on ? "border-ink bg-ink text-white" : "border-line bg-white text-muted hover:border-line-strong",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Abertura" htmlFor="h-open">
            <Input id="h-open" type="time" value={draft.openTime} onChange={(e) => setDraft({ ...draft, openTime: e.target.value })} />
          </Field>
          <Field label="Fechamento" htmlFor="h-close" error={invalid ? "Deve ser após a abertura" : undefined}>
            <Input id="h-close" type="time" value={draft.closeTime} onChange={(e) => setDraft({ ...draft, closeTime: e.target.value })} />
          </Field>
          <Field label="Intervalo da agenda" htmlFor="h-slot">
            <Select id="h-slot" value={draft.slotMinutes} onChange={(e) => setDraft({ ...draft, slotMinutes: Number(e.target.value) })}>
              {[15, 20, 30, 45, 60].map((m) => (
                <option key={m} value={m}>
                  {m} minutos
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="rounded-[14px] border border-line bg-ivory p-4">
          <Switch
            checked={draft.allowOnlineBooking}
            onChange={(v) => setDraft({ ...draft, allowOnlineBooking: v })}
            label="Agendamento online no site"
            description="Quando desativado, a página /agendar direciona o paciente para o WhatsApp."
          />
          <div className="mt-4 max-w-xs">
            <Field label="Antecedência mínima" htmlFor="h-lead" hint="Tempo mínimo entre o agendamento e a consulta.">
              <Select id="h-lead" value={draft.onlineBookingLeadHours} onChange={(e) => setDraft({ ...draft, onlineBookingLeadHours: Number(e.target.value) })} disabled={!draft.allowOnlineBooking}>
                {[0, 1, 2, 4, 12, 24, 48].map((h) => (
                  <option key={h} value={h}>
                    {h === 0 ? "Sem antecedência" : h < 24 ? `${h} hora${h > 1 ? "s" : ""}` : `${h / 24} dia${h > 24 ? "s" : ""}`}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function ProfessionalHoursRow({ professional, clinicDays }: { professional: Professional; clinicDays: number[] }) {
  const [hours, setHours] = useState<WorkingHours[]>(professional.workingHours);
  const [saving, setSaving] = useState(false);

  useEffect(() => setHours(professional.workingHours), [professional.workingHours]);

  const dirty = JSON.stringify(hours) !== JSON.stringify(professional.workingHours);
  const invalid = hours.some((h) => h.start >= h.end);

  const toggle = (weekday: number) =>
    setHours((list) =>
      list.some((h) => h.weekday === weekday)
        ? list.filter((h) => h.weekday !== weekday)
        : [...list, { weekday, start: "08:00", end: "18:00" }].sort((a, b) => a.weekday - b.weekday),
    );

  const save = async () => {
    if (invalid) return toast.error("Horário inválido", "O fim deve ser depois do início.");
    setSaving(true);
    try {
      await professionalService.update(professional.id, { workingHours: hours });
      toast.success("Horários salvos", professionalDisplayName(professional));
    } catch (e) {
      toast.error("Não foi possível salvar", e instanceof Error ? e.message : undefined);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border-b border-line px-5 py-4 last:border-0">
      <div className="flex flex-wrap items-center gap-3">
        <Avatar name={professional.name} src={professional.photo} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-semibold">{professionalDisplayName(professional)}</p>
          <p className="truncate text-[12px] text-subtle">{professional.specialty}</p>
        </div>
        {professional.showOnSite && professional.status === "ativo" ? (
          <Badge tone="gold">
            <span className="inline-flex items-center gap-1">
              <Globe className="size-3" /> Agenda online
            </span>
          </Badge>
        ) : (
          <Badge>Somente painel</Badge>
        )}
        <Button size="sm" variant="secondary" onClick={save} loading={saving} disabled={!dirty}>
          <Save /> Salvar
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label={`Dias de ${professional.name}`}>
        {WEEKDAY_SHORT.map((label, i) => {
          const on = hours.some((h) => h.weekday === i);
          return (
            <button
              key={label}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(i)}
              title={clinicDays.includes(i) ? undefined : "A clínica não atende neste dia"}
              className={cn(
                "h-8 min-w-11 rounded-[9px] border px-2.5 text-[12.5px] font-medium transition-colors",
                on ? "border-gold bg-gold-soft text-gold-dark" : "border-line bg-white text-subtle hover:border-line-strong",
                !clinicDays.includes(i) && "opacity-50",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
      {hours.length ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {hours.map((h) => (
            <div key={h.weekday} className="flex items-center gap-2 text-[13px]">
              <span className="w-9 font-medium">{WEEKDAY_SHORT[h.weekday]}</span>
              <Input type="time" value={h.start} className="w-28" aria-label={`Início ${WEEKDAY_SHORT[h.weekday]}`} onChange={(e) => setHours(hours.map((x) => (x.weekday === h.weekday ? { ...x, start: e.target.value } : x)))} />
              <span className="text-subtle">às</span>
              <Input type="time" value={h.end} className="w-28" aria-label={`Fim ${WEEKDAY_SHORT[h.weekday]}`} onChange={(e) => setHours(hours.map((x) => (x.weekday === h.weekday ? { ...x, end: e.target.value } : x)))} />
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-[12.5px] text-subtle">Sem dias de atendimento — não aparece no agendamento online.</p>
      )}
    </div>
  );
}

/** Horários de atendimento usados pela agenda do painel e pelo agendamento online do site. */
export function HoursView() {
  const { data: settings } = useSettings();
  const { data: professionals } = useProfessionals();

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Horários"
        description="Expediente da clínica, horários de cada profissional e regras do agendamento online."
        actions={
          <Link href="/admin/conteudo" className="inline-flex items-center gap-1 text-[13px] font-medium text-gold-dark hover:text-ink">
            Horários exibidos no site <ArrowUpRight className="size-4" />
          </Link>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        {settings ? <ClinicHoursCard settings={settings} /> : <Skeleton className="h-[460px]" />}
        <Card className="overflow-hidden">
          <CardHeader title="Horários por profissional" description="Os horários livres do site respeitam o expediente da clínica e a agenda de cada profissional." />
          {professionals && settings ? (
            <div className="border-t border-line">
              {professionals
                .filter((p) => p.status === "ativo")
                .map((p) => (
                  <ProfessionalHoursRow key={p.id} professional={p} clinicDays={settings.agenda.workingDays} />
                ))}
            </div>
          ) : (
            <CardBody>
              <Skeleton className="h-60" />
            </CardBody>
          )}
        </Card>
      </div>
    </div>
  );
}
