"use client";

import {
  CalendarClock,
  Check,
  CheckCheck,
  Clock,
  DoorOpen,
  ExternalLink,
  Pencil,
  Phone,
  Play,
  Stethoscope,
  Trash2,
  UserCheck,
  UserX,
  Wallet,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { WhatsappIcon } from "@/components/shared/social-icons";
import { Avatar } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Drawer } from "@/components/ui/drawer";
import { useSettings } from "@/features/settings/hooks";
import { useLookups } from "@/hooks/use-lookups";
import { toast } from "@/stores/toast-store";
import { endTime } from "@/utils/dates";
import { formatCurrency, formatDate, formatMinutes, formatPhone, firstName } from "@/utils/format";
import { fillTemplate, whatsappLink } from "@/utils/whatsapp";
import { appointmentService } from "../service";
import { APPOINTMENT_PAYMENT_LABELS, type Appointment, type AppointmentStatus } from "../types";
import { AppointmentStatusBadge } from "./status-badge";

interface Props {
  appointment: Appointment | null;
  onClose: () => void;
  onEdit: (appointment: Appointment) => void;
}

function Row({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="mt-0.5 text-subtle [&_svg]:size-4">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[11.5px] font-medium uppercase tracking-[0.08em] text-subtle">{label}</p>
        <div className="mt-0.5 text-[13.5px] text-ink">{children}</div>
      </div>
    </div>
  );
}

const NEXT_ACTION: Partial<Record<AppointmentStatus, { status: AppointmentStatus; label: string; done: string; icon: ReactNode }>> = {
  agendada: { status: "confirmada", label: "Confirmar", done: "Consulta confirmada", icon: <Check /> },
  aguardando: { status: "confirmada", label: "Confirmar", done: "Consulta confirmada", icon: <Check /> },
  confirmada: { status: "chegou", label: "Registrar chegada", done: "Chegada registrada", icon: <UserCheck /> },
  chegou: { status: "em-atendimento", label: "Iniciar atendimento", done: "Atendimento iniciado", icon: <Play /> },
  "em-atendimento": { status: "finalizada", label: "Finalizar", done: "Atendimento finalizado", icon: <CheckCheck /> },
};

export function AppointmentDrawer({ appointment, onClose, onEdit }: Props) {
  const lookups = useLookups();
  const { data: settings } = useSettings();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState<AppointmentStatus | null>(null);

  const a = appointment;
  const professional = lookups.professional(a?.professionalId);
  const treatment = lookups.treatment(a?.treatmentId);

  const setStatus = async (status: AppointmentStatus, message: string) => {
    if (!a) return;
    setBusy(status);
    try {
      await appointmentService.setStatus(a.id, status);
      toast.success(message, a.patientName);
    } finally {
      setBusy(null);
    }
  };

  const confirmationText = (() => {
    if (!a) return "";
    const template = settings?.whatsapp.templates.find((t) => t.key === "confirmacao")?.body ?? "";
    return fillTemplate(template, { nome: firstName(a.patientName), data: formatDate(a.date, "dd/MM"), hora: a.start });
  })();

  const next = a ? NEXT_ACTION[a.status] : undefined;
  const closed = a ? ["finalizada", "cancelada", "faltou"].includes(a.status) : false;

  return (
    <>
      <Drawer
        open={!!a}
        onClose={onClose}
        title="Detalhes da consulta"
        footer={
          a ? (
            <div className="flex flex-col gap-2">
              {next ? (
                <Button className="w-full" loading={busy === next.status} onClick={() => setStatus(next.status, next.done)}>
                  {next.icon} {next.label}
                </Button>
              ) : null}
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" onClick={() => onEdit(a)}>
                  <CalendarClock /> Remarcar
                </Button>
                <a
                  className={buttonVariants({ variant: "secondary" })}
                  href={whatsappLink(a.patientPhone, confirmationText)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <WhatsappIcon className="size-4 text-[#25D366]" /> WhatsApp
                </a>
              </div>
            </div>
          ) : null
        }
      >
        {a ? (
          <div className="px-5 py-5">
            <div className="flex items-start gap-3.5">
              <Avatar name={a.patientName} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold">{a.patientName}</p>
                <p className="text-[13px] text-muted">{treatment?.name ?? "Procedimento"}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <AppointmentStatusBadge status={a.status} />
                  {a.source === "online" ? <span className="rounded-full bg-gold-soft px-2 py-0.5 text-[11px] font-medium text-gold-dark">Agendamento online</span> : null}
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-[12px] border border-line bg-ivory px-4 py-3">
              <p className="text-[13px] font-semibold cap-first">{formatDate(a.date, "EEEE, d 'de' MMMM")}</p>
              <p className="mt-0.5 text-[22px] font-semibold tracking-[-0.02em] tabular">
                {a.start} <span className="text-subtle">—</span> {endTime(a.start, a.duration)}
              </p>
              <p className="text-[12.5px] text-muted">
                {formatMinutes(a.duration)} · {a.room}
              </p>
            </div>

            <div className="mt-4 divide-y divide-line">
              <Row icon={<Phone />} label="Telefone">
                <a href={`tel:${a.patientPhone}`} className="hover:text-gold-dark">
                  {formatPhone(a.patientPhone)}
                </a>
              </Row>
              <Row icon={<Stethoscope />} label="Profissional">
                {professional ? `${professional.title} ${professional.name}` : "—"}
              </Row>
              <Row icon={<DoorOpen />} label="Sala">
                {a.room}
              </Row>
              <Row icon={<Wallet />} label="Valor e pagamento">
                <span className="tabular">{a.price ? formatCurrency(a.price) : "Sem custo"}</span>
                <span className="text-muted"> · {APPOINTMENT_PAYMENT_LABELS[a.paymentStatus]}</span>
              </Row>
              <Row icon={<Clock />} label="Observação">
                {a.notes ? <span className="leading-relaxed">{a.notes}</span> : <span className="text-subtle">Sem observações.</span>}
              </Row>
            </div>

            {!closed ? (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="ghost" size="sm" onClick={() => setStatus("faltou", "Falta registrada")} loading={busy === "faltou"}>
                  <UserX /> Registrar falta
                </Button>
                <Button variant="danger-ghost" size="sm" onClick={() => setStatus("cancelada", "Consulta cancelada")} loading={busy === "cancelada"}>
                  <XCircle /> Cancelar
                </Button>
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-line pt-4">
              {a.patientId ? (
                <Link href={`/admin/pacientes/${a.patientId}`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
                  <ExternalLink /> Ver paciente
                </Link>
              ) : null}
              <Button variant="ghost" size="sm" onClick={() => onEdit(a)}>
                <Pencil /> Editar
              </Button>
              <Button variant="danger-ghost" size="sm" className="ml-auto" onClick={() => setConfirmDelete(true)}>
                <Trash2 /> Excluir
              </Button>
            </div>
          </div>
        ) : null}
      </Drawer>
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Excluir consulta?"
        description="O registro será removido da agenda. Para manter histórico, prefira cancelar a consulta."
        onConfirm={async () => {
          if (!a) return;
          await appointmentService.remove(a.id);
          toast.success("Consulta excluída");
          onClose();
        }}
      />
    </>
  );
}
