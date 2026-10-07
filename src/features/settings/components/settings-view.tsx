"use client";

import { AlertTriangle, ArrowUpRight, Keyboard, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Checkbox, Switch } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Segmented, Tabs } from "@/components/ui/tabs";
import { WEEKDAY_SHORT } from "@/features/professionals/types";
import { toast } from "@/stores/toast-store";
import { useUiStore } from "@/stores/ui-store";
import { PAYMENT_METHOD_LABELS, PAYMENT_METHODS } from "@/types/labels";
import { cn } from "@/utils/cn";
import { maskPhone, onlyDigits } from "@/utils/format";
import { useSettings } from "../hooks";
import { DatabaseCard } from "./database-card";
import { settingsService } from "../service";
import type { ClinicSettings } from "../types";
import { UsersPanel } from "./users-panel";

type TabId = "clinica" | "usuarios" | "agenda" | "financeiro" | "notificacoes" | "whatsapp" | "site" | "aparencia";

const TABS: { id: TabId; label: string }[] = [
  { id: "clinica", label: "Clínica" },
  { id: "usuarios", label: "Usuários" },
  { id: "agenda", label: "Agenda" },
  { id: "financeiro", label: "Financeiro" },
  { id: "notificacoes", label: "Notificações" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "site", label: "Site" },
  { id: "aparencia", label: "Aparência" },
];

export function SettingsView() {
  const params = useSearchParams();
  const { data } = useSettings();
  const { sidebarCollapsed, toggleSidebar, setShortcutsOpen } = useUiStore();
  const [tab, setTab] = useState<TabId>(() => (params.get("aba") as TabId) || "clinica");
  const [draft, setDraft] = useState<ClinicSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [newRoom, setNewRoom] = useState("");

  useEffect(() => {
    if (data && !draft) setDraft(data);
  }, [data, draft]);

  if (!draft || !data) return <Skeleton className="h-[600px]" />;

  const dirty = JSON.stringify(draft) !== JSON.stringify(data);
  const patch = <K extends keyof ClinicSettings>(key: K, value: Partial<ClinicSettings[K]>) =>
    setDraft((d) => (d ? { ...d, [key]: { ...d[key], ...value } } : d));

  const save = async () => {
    setSaving(true);
    try {
      await settingsService.save(draft);
      toast.success("Configurações salvas");
    } finally {
      setSaving(false);
    }
  };

  const saveBar = tab !== "usuarios" && tab !== "aparencia" && tab !== "site";

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Configurações"
        description="Dados da clínica, equipe, agenda, financeiro e comunicação."
        actions={
          saveBar ? (
            <>
              <Button variant="ghost" onClick={() => setDraft(data)} disabled={!dirty}>
                Descartar
              </Button>
              <Button onClick={save} loading={saving} disabled={!dirty}>
                <Save /> Salvar alterações
              </Button>
            </>
          ) : null
        }
      />
      <Tabs items={TABS} value={tab} onChange={setTab} label="Seções de configuração" className="mb-5" />

      {tab === "clinica" ? (
        <Card>
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome fantasia" htmlFor="s-name">
              <Input id="s-name" value={draft.clinic.name} onChange={(e) => patch("clinic", { name: e.target.value })} />
            </Field>
            <Field label="Razão social" htmlFor="s-legal">
              <Input id="s-legal" value={draft.clinic.legalName} onChange={(e) => patch("clinic", { legalName: e.target.value })} />
            </Field>
            <Field label="CNPJ" htmlFor="s-cnpj">
              <Input id="s-cnpj" value={draft.clinic.cnpj} onChange={(e) => patch("clinic", { cnpj: e.target.value })} />
            </Field>
            <Field label="Responsável técnico" htmlFor="s-rt">
              <Input id="s-rt" value={draft.clinic.technicalResponsible} onChange={(e) => patch("clinic", { technicalResponsible: e.target.value })} />
            </Field>
            <Field label="Telefone" htmlFor="s-phone">
              <Input id="s-phone" value={maskPhone(draft.clinic.phone)} onChange={(e) => patch("clinic", { phone: onlyDigits(e.target.value) })} />
            </Field>
            <Field label="WhatsApp" htmlFor="s-wa">
              <Input id="s-wa" value={maskPhone(draft.clinic.whatsapp)} onChange={(e) => patch("clinic", { whatsapp: onlyDigits(e.target.value) })} />
            </Field>
            <Field label="E-mail" htmlFor="s-email">
              <Input id="s-email" type="email" value={draft.clinic.email} onChange={(e) => patch("clinic", { email: e.target.value })} />
            </Field>
            <Field label="Instagram" htmlFor="s-ig">
              <Input id="s-ig" value={draft.clinic.instagram} onChange={(e) => patch("clinic", { instagram: e.target.value.replace("@", "") })} />
            </Field>
            <Field label="Endereço" htmlFor="s-addr" className="sm:col-span-2">
              <Input id="s-addr" value={draft.clinic.address} onChange={(e) => patch("clinic", { address: e.target.value })} />
            </Field>
            <p className="text-[12px] text-subtle sm:col-span-2">
              Logo, horários e textos exibidos no site são gerenciados em{" "}
              <Link href="/admin/conteudo" className="font-medium text-gold-dark hover:underline">
                Conteúdo
              </Link>
              .
            </p>
          </CardBody>
        </Card>
      ) : null}

      {tab === "usuarios" ? <UsersPanel /> : null}

      {tab === "agenda" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader title="Expediente" />
            <CardBody className="grid gap-4 sm:grid-cols-3">
              <Field label="Abertura" htmlFor="s-open">
                <Input id="s-open" type="time" value={draft.agenda.openTime} onChange={(e) => patch("agenda", { openTime: e.target.value })} />
              </Field>
              <Field label="Fechamento" htmlFor="s-close">
                <Input id="s-close" type="time" value={draft.agenda.closeTime} onChange={(e) => patch("agenda", { closeTime: e.target.value })} />
              </Field>
              <Field label="Intervalo (min)" htmlFor="s-slot">
                <Input id="s-slot" type="number" min={10} step={5} value={draft.agenda.slotMinutes} onChange={(e) => patch("agenda", { slotMinutes: Math.max(10, Number(e.target.value) || 30) })} />
              </Field>
              <Field label="Dias de atendimento" className="sm:col-span-3">
                <div className="flex flex-wrap gap-1.5">
                  {WEEKDAY_SHORT.map((d, i) => {
                    const on = draft.agenda.workingDays.includes(i);
                    return (
                      <button
                        key={d}
                        type="button"
                        aria-pressed={on}
                        onClick={() => patch("agenda", { workingDays: on ? draft.agenda.workingDays.filter((x) => x !== i) : [...draft.agenda.workingDays, i].sort() })}
                        className={cn("h-8 w-11 rounded-lg border text-[12px] font-medium", on ? "border-ink bg-ink text-white" : "border-line text-muted")}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </Field>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Salas e agendamento online" />
            <CardBody className="space-y-4">
              <ul className="space-y-1.5">
                {draft.agenda.rooms.map((r) => (
                  <li key={r} className="flex items-center justify-between rounded-[10px] bg-ivory px-3 py-2 text-[13px] ring-1 ring-line">
                    {r}
                    <button
                      type="button"
                      onClick={() => patch("agenda", { rooms: draft.agenda.rooms.filter((x) => x !== r) })}
                      disabled={draft.agenda.rooms.length === 1}
                      className="rounded-md p-1 text-subtle hover:text-danger disabled:opacity-30"
                      aria-label={`Remover ${r}`}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <Input value={newRoom} onChange={(e) => setNewRoom(e.target.value)} placeholder="Nova sala" aria-label="Nome da nova sala" />
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (!newRoom.trim() || draft.agenda.rooms.includes(newRoom.trim())) return;
                    patch("agenda", { rooms: [...draft.agenda.rooms, newRoom.trim()] });
                    setNewRoom("");
                  }}
                >
                  <Plus /> Adicionar
                </Button>
              </div>
              <div className="h-px bg-line" />
              <Switch checked={draft.agenda.allowOnlineBooking} onChange={(v) => patch("agenda", { allowOnlineBooking: v })} label="Agendamento online" description="Permite que pacientes agendem pelo site." />
              <Field label="Antecedência mínima (horas)" htmlFor="s-lead">
                <Input id="s-lead" type="number" min={0} value={draft.agenda.onlineBookingLeadHours} onChange={(e) => patch("agenda", { onlineBookingLeadHours: Math.max(0, Number(e.target.value) || 0) })} />
              </Field>
            </CardBody>
          </Card>
        </div>
      ) : null}

      {tab === "financeiro" ? (
        <Card>
          <CardBody className="grid gap-5 sm:grid-cols-2">
            <Field label="Formas de pagamento aceitas" className="sm:col-span-2">
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {PAYMENT_METHODS.map((m) => (
                  <Checkbox
                    key={m}
                    checked={draft.finance.acceptedMethods.includes(m)}
                    onChange={(c) => patch("finance", { acceptedMethods: c ? [...draft.finance.acceptedMethods, m] : draft.finance.acceptedMethods.filter((x) => x !== m) })}
                    label={PAYMENT_METHOD_LABELS[m]}
                  />
                ))}
              </div>
            </Field>
            <Field label="Parcelamento máximo" htmlFor="s-inst">
              <Input id="s-inst" type="number" min={1} max={24} value={draft.finance.maxInstallments} onChange={(e) => patch("finance", { maxInstallments: Math.min(24, Math.max(1, Number(e.target.value) || 1)) })} />
            </Field>
            <Field label="Validade padrão das propostas (dias)" htmlFor="s-valid">
              <Input id="s-valid" type="number" min={1} value={draft.finance.proposalValidityDays} onChange={(e) => patch("finance", { proposalValidityDays: Math.max(1, Number(e.target.value) || 15) })} />
            </Field>
            <Field label="Comissão padrão (%)" htmlFor="s-comm">
              <Input id="s-comm" type="number" min={0} max={100} value={Math.round(draft.finance.defaultCommission * 100)} onChange={(e) => patch("finance", { defaultCommission: (Number(e.target.value) || 0) / 100 })} />
            </Field>
            <Field label="Condições de pagamento padrão" htmlFor="s-terms" hint="Pré-preenchidas em novos orçamentos." className="sm:col-span-2">
              <Textarea id="s-terms" rows={2} value={draft.finance.defaultPaymentTerms} onChange={(e) => patch("finance", { defaultPaymentTerms: e.target.value })} />
            </Field>
          </CardBody>
        </Card>
      ) : null}

      {tab === "notificacoes" ? (
        <Card>
          <CardBody className="space-y-4">
            {(
              [
                ["newAppointment", "Nova consulta", "Agendamentos feitos pelo site."],
                ["paymentDue", "Pagamento vencendo", "Parcelas próximas do vencimento."],
                ["newLead", "Novo lead", "Leads cadastrados no CRM."],
                ["cancellation", "Consulta cancelada", "Cancelamentos registrados na agenda."],
                ["patientWaiting", "Paciente aguardando", "Chegada registrada na recepção."],
                ["pendingReturn", "Retorno pendente", "Pacientes sem consulta há mais de 6 meses."],
              ] as [keyof ClinicSettings["notifications"], string, string][]
            ).map(([key, label, desc], i) => (
              <div key={key}>
                {i > 0 ? <div className="mb-4 h-px bg-line" /> : null}
                <Switch checked={draft.notifications[key]} onChange={(v) => patch("notifications", { [key]: v })} label={label} description={desc} />
              </div>
            ))}
          </CardBody>
        </Card>
      ) : null}

      {tab === "whatsapp" ? (
        <Card>
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <Field label="Número de envio" htmlFor="s-sender" hint="Número da clínica usado no WhatsApp.">
              <Input id="s-sender" value={maskPhone(draft.whatsapp.senderNumber)} onChange={(e) => patch("whatsapp", { senderNumber: onlyDigits(e.target.value) })} />
            </Field>
            <Field label="Assinatura" htmlFor="s-sign">
              <Input id="s-sign" value={draft.whatsapp.signature} onChange={(e) => patch("whatsapp", { signature: e.target.value })} />
            </Field>
            <div className="rounded-[12px] border border-line bg-ivory p-4 text-[13px] leading-relaxed text-muted sm:col-span-2">
              As mensagens são abertas no WhatsApp Web ou no aplicativo com o texto pronto. Modelos e filas ficam na{" "}
              <Link href="/admin/whatsapp" className="font-medium text-gold-dark hover:underline">
                central de WhatsApp
              </Link>
              .
            </div>
          </CardBody>
        </Card>
      ) : null}

      {tab === "site" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader title="Conteúdo do site" description="Textos, imagens, depoimentos, contatos e SEO." />
            <CardBody>
              <Link href="/admin/conteudo" className={buttonVariants({ variant: "secondary" })}>
                Abrir editor de conteúdo <ArrowUpRight />
              </Link>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Agendamento online" description={draft.agenda.allowOnlineBooking ? "Ativo no site" : "Desativado"} />
            <CardBody className="flex flex-wrap gap-2">
              <Link href="/agendar" target="_blank" className={buttonVariants({ variant: "secondary" })}>
                Testar agendamento <ArrowUpRight />
              </Link>
              <Button variant="ghost" onClick={() => setTab("agenda")}>
                Ajustar regras
              </Button>
            </CardBody>
          </Card>
        </div>
      ) : null}

      {tab === "aparencia" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader title="Menu lateral" description="Preferência salva neste navegador." />
            <CardBody>
              <Segmented
                label="Modo do menu"
                value={sidebarCollapsed ? "compacto" : "expandido"}
                onChange={(v) => {
                  if ((v === "compacto") !== sidebarCollapsed) toggleSidebar();
                }}
                options={[
                  { value: "expandido", label: "Expandido" },
                  { value: "compacto", label: "Compacto" },
                ]}
              />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Atalhos de teclado" description="Navegação rápida com Ctrl+K e G + letra." />
            <CardBody>
              <Button variant="secondary" onClick={() => setShortcutsOpen(true)}>
                <Keyboard /> Ver atalhos
              </Button>
            </CardBody>
          </Card>
        </div>
      ) : null}

      <DatabaseCard onReset={() => setConfirmReset(true)} />

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Restaurar dados iniciais?"
        description="Pacientes, agenda, CRM, financeiro, conteúdo e configurações voltam aos dados iniciais no banco. Usuários e senhas são mantidos. Esta ação afeta todos os acessos ao painel."
        confirmLabel="Restaurar"
        onConfirm={async () => {
          await settingsService.resetDemo();
          setDraft(null);
          toast.success("Dados iniciais restaurados");
        }}
      />
      {dirty && saveBar ? (
        <div className="sticky bottom-4 z-30 mt-6 flex items-center justify-between gap-3 rounded-[14px] bg-ink px-4 py-3 text-white shadow-[var(--shadow-pop)]">
          <p className="flex items-center gap-2 text-[13px]">
            <AlertTriangle className="size-4 text-champagne" /> Alterações não salvas
          </p>
          <Button size="sm" variant="gold" onClick={save} loading={saving}>
            Salvar
          </Button>
        </div>
      ) : null}
    </div>
  );
}
