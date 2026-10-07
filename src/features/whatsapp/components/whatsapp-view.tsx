"use client";

import { addDays, format, subMonths } from "date-fns";
import { CalendarCheck, Clock, HeartHandshake, MessageCircle, Plus, RotateCcw, Save, Send, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { WhatsappIcon } from "@/components/shared/social-icons";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { useAppointments } from "@/features/appointments/hooks";
import type { Appointment } from "@/features/appointments/types";
import { useLeads } from "@/features/crm/hooks";
import { usePatientOverviews } from "@/features/patients/hooks";
import { useSettings } from "@/features/settings/hooks";
import { settingsService } from "@/features/settings/service";
import type { WhatsappTemplate } from "@/features/settings/types";
import { useLookups } from "@/hooks/use-lookups";
import { toast } from "@/stores/toast-store";
import { cn } from "@/utils/cn";
import { todayISO } from "@/utils/dates";
import { createId } from "@/utils/id";
import { firstName, formatDate, formatPhone } from "@/utils/format";
import { fillTemplate, whatsappLink } from "@/utils/whatsapp";

const VARIABLES = ["nome", "data", "hora", "profissional", "tratamento"];

type QueueKind = "confirmacao" | "lembrete" | "pos-atendimento" | "retorno";

interface QueueItem {
  id: string;
  name: string;
  phone: string;
  detail: string;
  vars: Record<string, string>;
}

export function WhatsappView() {
  const { data: settings } = useSettings();
  const { data: appointments = [] } = useAppointments();
  const { data: overviews = [] } = usePatientOverviews();
  const { data: leads = [] } = useLeads();
  const lookups = useLookups();
  const [templates, setTemplates] = useState<WhatsappTemplate[]>([]);
  const [activeTemplateId, setActiveTemplateId] = useState<string>("");
  const [recipient, setRecipient] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [queue, setQueue] = useState<QueueKind>("confirmacao");
  const [savingTemplates, setSavingTemplates] = useState(false);
  const [sent, setSent] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (settings && templates.length === 0) {
      setTemplates(settings.whatsapp.templates);
      setActiveTemplateId(settings.whatsapp.templates[0]?.id ?? "");
    }
  }, [settings, templates.length]);

  const templatesDirty = settings ? JSON.stringify(templates) !== JSON.stringify(settings.whatsapp.templates) : false;
  const tpl = (key: WhatsappTemplate["key"]) => templates.find((t) => t.key === key)?.body ?? "";
  const varsFor = (a: Appointment) => ({
    nome: firstName(a.patientName),
    data: formatDate(a.date, "dd/MM"),
    hora: a.start,
    profissional: lookups.professionalName(a.professionalId),
    tratamento: lookups.treatmentName(a.treatmentId),
  });

  const queues = useMemo(() => {
    const today = todayISO();
    const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");
    const sixMonthsAgo = format(subMonths(new Date(), 6), "yyyy-MM-dd");
    const toItem = (a: Appointment, detail: string): QueueItem => ({ id: a.id, name: a.patientName, phone: a.patientPhone, detail, vars: varsFor(a) });
    return {
      confirmacao: appointments
        .filter((a) => a.date >= today && a.date <= format(addDays(new Date(), 3), "yyyy-MM-dd") && (a.status === "agendada" || a.status === "aguardando"))
        .sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`))
        .map((a) => toItem(a, `${formatDate(a.date, "EEE dd/MM")} às ${a.start} · ${lookups.treatmentName(a.treatmentId)}`)),
      lembrete: appointments
        .filter((a) => a.date === tomorrow && !["cancelada", "faltou"].includes(a.status))
        .sort((a, b) => a.start.localeCompare(b.start))
        .map((a) => toItem(a, `Amanhã às ${a.start} · ${lookups.treatmentName(a.treatmentId)}`)),
      "pos-atendimento": appointments
        .filter((a) => a.date === today && a.status === "finalizada")
        .map((a) => toItem(a, `Atendido hoje · ${lookups.treatmentName(a.treatmentId)}`)),
      retorno: overviews
        .filter((o) => o.patient.status !== "inativo" && !o.nextAppointment && o.lastAppointment && o.lastAppointment.date < sixMonthsAgo)
        .map((o) => ({ id: o.patient.id, name: o.patient.name, phone: o.patient.phone, detail: `Última consulta em ${formatDate(o.lastAppointment!.date)}`, vars: { nome: firstName(o.patient.name) } }))
        .concat(
          overviews
            .filter((o) => o.patient.status === "inativo")
            .map((o) => ({ id: o.patient.id, name: o.patient.name, phone: o.patient.phone, detail: "Paciente inativo", vars: { nome: firstName(o.patient.name) } })),
        ),
    } satisfies Record<QueueKind, QueueItem[]>;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointments, overviews, lookups]);

  const queueTemplate: Record<QueueKind, WhatsappTemplate["key"]> = {
    confirmacao: "confirmacao",
    lembrete: "lembrete",
    "pos-atendimento": "pos-atendimento",
    retorno: "retorno",
  };

  const recipients = useMemo(
    () => [
      ...lookups.patients.map((p) => ({ value: `p:${p.id}`, label: p.name, description: `Paciente · ${formatPhone(p.phone)}`, keywords: p.phone, leading: <Avatar name={p.name} size="xs" /> })),
      ...leads.filter((l) => !l.patientId).map((l) => ({ value: `l:${l.id}`, label: l.name, description: `Lead · ${l.interest}`, keywords: l.phone, leading: <Avatar name={l.name} size="xs" /> })),
    ],
    [lookups.patients, leads],
  );

  const recipientInfo = useMemo(() => {
    if (!recipient) return null;
    const [kind, id] = recipient.split(":");
    if (kind === "p") {
      const p = lookups.patient(id);
      if (!p) return null;
      const next = appointments.filter((a) => a.patientId === id && a.date >= todayISO() && a.status !== "cancelada").sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`))[0];
      return { name: p.name, phone: p.phone, vars: next ? varsFor(next) : { nome: firstName(p.name) } };
    }
    const l = leads.find((x) => x.id === id);
    return l ? { name: l.name, phone: l.phone, vars: { nome: firstName(l.name), tratamento: l.interest } } : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipient, lookups, leads, appointments]);

  const applyTemplate = (t: WhatsappTemplate | undefined) => {
    if (!t) return;
    setActiveTemplateId(t.id);
    setMessage(fillTemplate(t.body, recipientInfo?.vars ?? {}));
  };

  const editing = templates.find((t) => t.id === activeTemplateId);

  const QUEUE_TABS: { id: QueueKind; label: string; icon: ReactNode; count: number }[] = [
    { id: "confirmacao", label: "Confirmações", icon: <CalendarCheck />, count: queues.confirmacao.length },
    { id: "lembrete", label: "Lembretes", icon: <Clock />, count: queues.lembrete.length },
    { id: "pos-atendimento", label: "Pós-atendimento", icon: <HeartHandshake />, count: queues["pos-atendimento"].length },
    { id: "retorno", label: "Retornos", icon: <RotateCcw />, count: queues.retorno.length },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="WhatsApp"
        description="Central de comunicação com pacientes: filas automáticas, envio rápido e modelos de mensagem."
        actions={
          <Badge tone="success" dot>
            Envio via WhatsApp Web / App ({formatPhone(settings?.whatsapp.senderNumber)})
          </Badge>
        }
      />

      <Card className="mb-4 overflow-hidden">
        <div className="px-4 pt-3 sm:px-5">
          <Tabs items={QUEUE_TABS} value={queue} onChange={setQueue} label="Filas de mensagens" />
        </div>
        <CardBody className="pt-4">
          {queues[queue].length === 0 ? (
            <EmptyState compact icon={<MessageCircle />} title="Nenhuma mensagem pendente nesta fila" />
          ) : (
            <ul className="grid gap-2 md:grid-cols-2">
              {queues[queue].map((item) => {
                const text = fillTemplate(tpl(queueTemplate[queue]), item.vars);
                const done = sent.has(`${queue}-${item.id}`);
                return (
                  <li key={item.id} className={cn("flex items-center gap-3 rounded-[12px] border border-line p-3 transition-opacity", done && "opacity-60")}>
                    <Avatar name={item.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-medium">{item.name}</p>
                      <p className="truncate text-[12px] text-subtle">{item.detail}</p>
                    </div>
                    <a
                      href={whatsappLink(item.phone, text)}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setSent((s) => new Set(s).add(`${queue}-${item.id}`))}
                      className={cn(
                        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-[9px] px-3 text-[12.5px] font-medium transition-colors",
                        done ? "bg-success-soft text-success" : "bg-ink text-white hover:bg-ink-2",
                      )}
                      title={text}
                    >
                      <WhatsappIcon className="size-3.5" /> {done ? "Enviado" : "Enviar"}
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </CardBody>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.1fr]">
        <Card>
          <CardHeader title="Mensagem rápida" description="Escolha o destinatário e um modelo — as variáveis são preenchidas automaticamente." />
          <CardBody className="space-y-4">
            <Field label="Destinatário" htmlFor="wa-to">
              <Combobox id="wa-to" options={recipients} value={recipient} onChange={(v) => { setRecipient(v); setMessage(""); }} placeholder="Paciente ou lead" />
            </Field>
            <div className="flex flex-wrap gap-1.5">
              {templates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => applyTemplate(t)}
                  className="rounded-full border border-line px-2.5 py-1 text-[12px] font-medium text-ink-2 transition-colors hover:border-gold hover:text-gold-dark"
                >
                  {t.name}
                </button>
              ))}
            </div>
            <Field label="Mensagem" htmlFor="wa-msg">
              <Textarea id="wa-msg" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Selecione um modelo ou escreva a mensagem" />
            </Field>
            <div className="rounded-[14px] bg-[#efeae2] p-4">
              <div className="ml-auto max-w-[85%] rounded-[12px] rounded-tr-[4px] bg-[#d9fdd3] px-3 py-2 text-[13px] leading-relaxed text-[#111b21] shadow-sm">
                {message ? <p className="whitespace-pre-wrap">{message}</p> : <p className="text-[#667781]">Pré-visualização da mensagem</p>}
                <p className="mt-1 text-right text-[10.5px] text-[#667781]">{format(new Date(), "HH:mm")}</p>
              </div>
            </div>
            {recipientInfo && message ? (
              <a
                href={whatsappLink(recipientInfo.phone, message)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[10px] bg-[#1f8f4e] text-sm font-medium text-white transition-colors hover:bg-[#187a42]"
              >
                <Send className="size-4" /> Abrir no WhatsApp · {recipientInfo.name.split(" ")[0]}
              </a>
            ) : (
              <Button className="h-10 w-full" variant="subtle" disabled>
                <Send /> Selecione o destinatário e a mensagem
              </Button>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Modelos de mensagem"
            description="Use variáveis entre chaves."
            action={
              <Button
                size="sm"
                loading={savingTemplates}
                disabled={!templatesDirty}
                onClick={async () => {
                  if (!settings) return;
                  setSavingTemplates(true);
                  await settingsService.patchSection("whatsapp", { ...settings.whatsapp, templates });
                  setSavingTemplates(false);
                  toast.success("Modelos salvos");
                }}
              >
                <Save /> Salvar
              </Button>
            }
          />
          <CardBody className="grid gap-4 md:grid-cols-[180px_1fr]">
            <ul className="space-y-1">
              {templates.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setActiveTemplateId(t.id)}
                    className={cn("w-full rounded-[9px] px-3 py-2 text-left text-[13px] font-medium transition-colors", t.id === activeTemplateId ? "bg-ink text-white" : "text-ink-2 hover:bg-sand")}
                  >
                    {t.name}
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => {
                    const t: WhatsappTemplate = { id: createId("tpl"), key: "personalizado", name: "Novo modelo", body: "Olá, {nome}! " };
                    setTemplates((list) => [...list, t]);
                    setActiveTemplateId(t.id);
                  }}
                  className="flex w-full items-center gap-1.5 rounded-[9px] px-3 py-2 text-left text-[13px] font-medium text-gold-dark hover:bg-gold-soft"
                >
                  <Plus className="size-3.5" /> Novo modelo
                </button>
              </li>
            </ul>
            {editing ? (
              <div className="space-y-3">
                <Field label="Nome do modelo" htmlFor="tpl-name">
                  <Input id="tpl-name" value={editing.name} onChange={(e) => setTemplates((list) => list.map((t) => (t.id === editing.id ? { ...t, name: e.target.value } : t)))} />
                </Field>
                <Field label="Texto" htmlFor="tpl-body">
                  <Textarea id="tpl-body" rows={6} value={editing.body} onChange={(e) => setTemplates((list) => list.map((t) => (t.id === editing.id ? { ...t, body: e.target.value } : t)))} />
                </Field>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[12px] text-subtle">Inserir:</span>
                  {VARIABLES.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setTemplates((list) => list.map((t) => (t.id === editing.id ? { ...t, body: `${t.body}{${v}}` } : t)))}
                      className="rounded-md bg-sand px-2 py-0.5 font-mono text-[11.5px] text-ink-2 hover:bg-gold-soft"
                    >
                      {`{${v}}`}
                    </button>
                  ))}
                </div>
                {editing.key === "personalizado" ? (
                  <Button
                    variant="danger-ghost"
                    size="sm"
                    onClick={() => {
                      setTemplates((list) => list.filter((t) => t.id !== editing.id));
                      setActiveTemplateId(templates[0]?.id ?? "");
                    }}
                  >
                    <Trash2 /> Remover modelo
                  </Button>
                ) : (
                  <p className="text-[12px] text-subtle">Modelo do sistema — usado nas filas automáticas.</p>
                )}
              </div>
            ) : null}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
