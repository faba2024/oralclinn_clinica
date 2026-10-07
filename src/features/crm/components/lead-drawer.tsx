"use client";

import { ArrowRightLeft, CalendarPlus, Mail, MessageSquare, Pencil, Phone, PhoneCall, Stethoscope, StickyNote, Trash2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { WhatsappIcon } from "@/components/shared/social-icons";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Drawer } from "@/components/ui/drawer";
import { Select, Textarea } from "@/components/ui/input";
import { Segmented } from "@/components/ui/tabs";
import { useLookups } from "@/hooks/use-lookups";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "@/stores/toast-store";
import { LEAD_SOURCE_LABELS } from "@/types/labels";
import { firstName, formatCurrency, formatDate, formatPhone, formatRelative } from "@/utils/format";
import { whatsappLink } from "@/utils/whatsapp";
import { crmService } from "../service";
import { LEAD_EVENT_LABELS, LEAD_STAGES, type Lead, type LeadEventType, type LeadStage } from "../types";

const EVENT_ICONS: Record<LeadEventType, ReactNode> = {
  contato: <Phone />,
  mensagem: <MessageSquare />,
  ligacao: <PhoneCall />,
  avaliacao: <Stethoscope />,
  observacao: <StickyNote />,
  etapa: <ArrowRightLeft />,
};

interface Props {
  lead: Lead | null;
  onClose: () => void;
  onEdit: (lead: Lead) => void;
}

export function LeadDrawer({ lead, onClose, onEdit }: Props) {
  const lookups = useLookups();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [type, setType] = useState<Exclude<LeadEventType, "etapa">>("mensagem");
  const [text, setText] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const author = user?.name ?? "Equipe";

  const addEvent = async () => {
    if (!lead || !text.trim()) return;
    await crmService.addEvent(lead.id, { type, description: text.trim(), author });
    setText("");
    toast.success("Registro adicionado à timeline");
  };

  return (
    <>
      <Drawer
        open={!!lead}
        onClose={onClose}
        title="Lead"
        width="sm:max-w-[500px]"
        footer={
          lead ? (
            <div className="grid grid-cols-2 gap-2">
              <a
                href={whatsappLink(lead.phone, `Olá, ${firstName(lead.name)}! Aqui é da Oralclin. Vi seu interesse em ${lead.interest.toLowerCase()} e gostaria de te ajudar.`)}
                target="_blank"
                rel="noreferrer"
                onClick={() => void crmService.addEvent(lead.id, { type: "mensagem", description: "Mensagem enviada pelo WhatsApp.", author })}
                className={buttonVariants({ variant: "primary" })}
              >
                <WhatsappIcon className="size-4" /> Abrir WhatsApp
              </a>
              {lead.patientId ? (
                <Link href={`/admin/pacientes/${lead.patientId}`} className={buttonVariants({ variant: "secondary" })}>
                  Ver paciente
                </Link>
              ) : (
                <Button
                  variant="secondary"
                  onClick={async () => {
                    const id = await crmService.convertToPatient(lead.id, author);
                    if (id) {
                      toast.success("Paciente criado a partir do lead", lead.name);
                      router.push(`/admin/pacientes/${id}`);
                    }
                  }}
                >
                  <UserPlus /> Converter em paciente
                </Button>
              )}
            </div>
          ) : null
        }
      >
        {lead ? (
          <div className="px-5 py-5">
            <div className="flex items-start gap-3.5">
              <Avatar name={lead.name} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold">{lead.name}</p>
                <p className="text-[13px] text-muted">{lead.interest}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge tone="gold">{LEAD_SOURCE_LABELS[lead.source]}</Badge>
                  <Badge tone={lead.stage === "fechado" ? "success" : lead.stage === "perdido" ? "danger" : "neutral"}>
                    {LEAD_STAGES.find((s) => s.id === lead.stage)?.label}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon-sm" onClick={() => onEdit(lead)} aria-label="Editar lead">
                  <Pencil />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => setConfirmDelete(true)} aria-label="Excluir lead">
                  <Trash2 />
                </Button>
              </div>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 rounded-[12px] border border-line bg-ivory p-4 text-[13px]">
              <div>
                <dt className="text-[11.5px] text-subtle">WhatsApp</dt>
                <dd className="mt-0.5 font-medium tabular">{formatPhone(lead.phone)}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-[11.5px] text-subtle">E-mail</dt>
                <dd className="mt-0.5 truncate font-medium">{lead.email ? <a href={`mailto:${lead.email}`} className="hover:text-gold-dark"><Mail className="mr-1 inline size-3" />{lead.email}</a> : "—"}</dd>
              </div>
              <div>
                <dt className="text-[11.5px] text-subtle">Valor potencial</dt>
                <dd className="mt-0.5 font-semibold tabular">{formatCurrency(lead.potentialValue)}</dd>
              </div>
              <div>
                <dt className="text-[11.5px] text-subtle">Responsável</dt>
                <dd className="mt-0.5 font-medium">{lookups.userName(lead.ownerId)}</dd>
              </div>
              <div>
                <dt className="text-[11.5px] text-subtle">Entrada</dt>
                <dd className="mt-0.5 font-medium tabular">{formatDate(lead.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-[11.5px] text-subtle">Último contato</dt>
                <dd className="mt-0.5 font-medium">{lead.lastContactAt ? formatRelative(lead.lastContactAt) : "—"}</dd>
              </div>
            </dl>

            <div className="mt-4 flex items-center gap-2">
              <label htmlFor="lead-stage" className="text-[12.5px] font-medium text-muted">
                Etapa
              </label>
              <Select
                id="lead-stage"
                value={lead.stage}
                onChange={async (e) => {
                  await crmService.moveStage(lead.id, e.target.value as LeadStage, author);
                  toast.success("Etapa atualizada");
                }}
              >
                {LEAD_STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </Select>
              <Link href={`/admin/agenda?nova=1`} className={buttonVariants({ variant: "secondary", size: "sm", className: "shrink-0" })}>
                <CalendarPlus /> Avaliação
              </Link>
            </div>

            {lead.notes || lead.lostReason ? (
              <p className="mt-4 rounded-[10px] bg-sand px-3 py-2.5 text-[13px] leading-relaxed text-ink-2">{lead.lostReason ? `Motivo da perda: ${lead.lostReason}` : lead.notes}</p>
            ) : null}

            <div className="mt-6">
              <p className="mb-2 text-[13px] font-semibold">Registrar interação</p>
              <Segmented
                size="sm"
                label="Tipo de registro"
                value={type}
                onChange={setType}
                options={[
                  { value: "mensagem", label: "Mensagem" },
                  { value: "ligacao", label: "Ligação" },
                  { value: "contato", label: "Contato" },
                  { value: "avaliacao", label: "Avaliação" },
                  { value: "observacao", label: "Nota" },
                ]}
                className="flex-wrap"
              />
              <Textarea className="mt-2" rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="Descreva a interação" aria-label="Descrição da interação" />
              <Button size="sm" className="mt-2" onClick={addEvent} disabled={!text.trim()}>
                Adicionar à timeline
              </Button>
            </div>

            <div className="mt-6">
              <p className="mb-3 text-[13px] font-semibold">Timeline</p>
              <ol className="relative ml-3 border-l border-line">
                {[...lead.timeline].reverse().map((e) => (
                  <li key={e.id} className="relative pb-4 pl-6 last:pb-0">
                    <span className="absolute -left-[12px] top-0 flex size-6 items-center justify-center rounded-full border border-line bg-white text-gold-dark [&_svg]:size-3">
                      {EVENT_ICONS[e.type]}
                    </span>
                    <p className="text-[12px] font-semibold text-ink-2">
                      {LEAD_EVENT_LABELS[e.type]} <span className="font-normal text-subtle">· {e.author}</span>
                    </p>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-ink">{e.description}</p>
                    <p className="mt-0.5 text-[11.5px] text-subtle">{formatDate(e.at, "dd/MM/yyyy 'às' HH:mm")}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        ) : null}
      </Drawer>
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Excluir lead?"
        description="O lead e sua timeline serão removidos do CRM."
        onConfirm={async () => {
          if (lead) await crmService.remove(lead.id);
          toast.success("Lead excluído");
          onClose();
        }}
      />
    </>
  );
}
