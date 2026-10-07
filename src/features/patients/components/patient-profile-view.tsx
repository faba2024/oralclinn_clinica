"use client";

import {
  CalendarDays,
  ClipboardList,
  FileText,
  Images,
  LayoutGrid,
  Mail,
  Paperclip,
  Pencil,
  Phone,
  History,
  Trash2,
  Wallet,
  UserX,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { WhatsappIcon } from "@/components/shared/social-icons";
import { Avatar } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";
import { DocumentsPanel } from "@/features/documents/components/documents-panel";
import { ClinicalRecordPanel } from "@/features/records/components/clinical-record-panel";
import { canAccess } from "@/features/users/permissions";
import { useLookups } from "@/hooks/use-lookups";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "@/stores/toast-store";
import { LEAD_SOURCE_LABELS } from "@/types/labels";
import { calculateAge, firstName, formatDate, formatPhone } from "@/utils/format";
import { whatsappLink } from "@/utils/whatsapp";
import { usePatientOverview } from "../hooks";
import { patientService } from "../service";
import { PatientFormDialog } from "./patient-form-dialog";
import { PatientStatusBadge } from "./patient-status-badge";
import { AppointmentsTab } from "./profile/appointments-tab";
import { FinanceTab } from "./profile/finance-tab";
import { HistoryTab } from "./profile/history-tab";
import { PhotosTab } from "./profile/photos-tab";
import { PlansTab } from "./profile/plans-tab";
import { SummaryTab } from "./profile/summary-tab";

type TabId = "resumo" | "consultas" | "prontuario" | "tratamentos" | "financeiro" | "documentos" | "fotos" | "historico";

export function PatientProfileView({ id }: { id: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const role = useAuthStore((s) => s.user?.role);
  const lookups = useLookups();
  const { data: overview, loading } = usePatientOverview(id);
  const [tab, setTab] = useState<TabId>(() => (params.get("aba") as TabId) || "resumo");
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (loading && overview === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (!overview) {
    return (
      <EmptyState
        icon={<UserX />}
        title="Paciente não encontrado"
        description="O cadastro pode ter sido removido."
        action={<Link href="/admin/pacientes" className={buttonVariants({ variant: "secondary" })}>Voltar para pacientes</Link>}
      />
    );
  }

  const { patient } = overview;
  const age = calculateAge(patient.birthDate);
  const canRecords = canAccess(role, "prontuarios");
  const canFinance = canAccess(role, "financeiro");

  const tabs = [
    { id: "resumo" as const, label: "Resumo", icon: <LayoutGrid /> },
    { id: "consultas" as const, label: "Consultas", icon: <CalendarDays /> },
    ...(canRecords ? [{ id: "prontuario" as const, label: "Prontuário", icon: <ClipboardList /> }] : []),
    { id: "tratamentos" as const, label: "Tratamentos", icon: <FileText /> },
    ...(canFinance || role === "recepcao" ? [{ id: "financeiro" as const, label: "Financeiro", icon: <Wallet /> }] : []),
    { id: "documentos" as const, label: "Documentos", icon: <Paperclip /> },
    { id: "fotos" as const, label: "Fotos", icon: <Images /> },
    { id: "historico" as const, label: "Histórico", icon: <History /> },
  ];
  const activeTab = tabs.some((t) => t.id === tab) ? tab : "resumo";

  return (
    <div className="animate-fade-in">
      <PageHeader
        breadcrumb={[{ label: "Pacientes", href: "/admin/pacientes" }, { label: patient.name }]}
        title={<span className="sr-only">{patient.name}</span>}
        className="mb-4 sm:mb-4"
      />

      <Card className="mb-5 p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <Avatar name={patient.name} src={patient.photo} size="xl" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold tracking-[-0.02em] sm:text-2xl">{patient.name}</h1>
                <PatientStatusBadge status={patient.status} />
              </div>
              <p className="mt-1 text-[13px] text-muted">
                {age !== null ? `${age} anos` : "Idade não informada"}
                {patient.occupation ? ` · ${patient.occupation}` : ""} · Origem: {LEAD_SOURCE_LABELS[patient.origin]}
                {patient.responsibleProfessionalId ? ` · ${lookups.professionalName(patient.responsibleProfessionalId)}` : ""}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
                <a href={`tel:${patient.phone}`} className="flex items-center gap-1.5 text-ink-2 hover:text-gold-dark">
                  <Phone className="size-3.5 text-subtle" /> {formatPhone(patient.phone)}
                </a>
                {patient.email ? (
                  <a href={`mailto:${patient.email}`} className="flex items-center gap-1.5 text-ink-2 hover:text-gold-dark">
                    <Mail className="size-3.5 text-subtle" /> {patient.email}
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-3 rounded-[12px] bg-ivory p-3 text-[12.5px] ring-1 ring-line sm:min-w-[300px]">
            <div>
              <dt className="text-subtle">Última consulta</dt>
              <dd className="mt-0.5 font-semibold tabular">{overview.lastAppointment ? formatDate(overview.lastAppointment.date) : "—"}</dd>
            </div>
            <div>
              <dt className="text-subtle">Próxima consulta</dt>
              <dd className="mt-0.5 font-semibold tabular">
                {overview.nextAppointment ? `${formatDate(overview.nextAppointment.date, "dd/MM")} · ${overview.nextAppointment.start}` : "—"}
              </dd>
            </div>
          </dl>

          <div className="flex items-center gap-2">
            <a
              href={whatsappLink(patient.phone, `Olá, ${firstName(patient.name)}! Aqui é da Oralclin.`)}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: "secondary" })}
            >
              <WhatsappIcon className="size-4 text-[#25D366]" /> WhatsApp
            </a>
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              <Pencil /> Editar
            </Button>
            <DropdownMenu
              items={[
                { label: "Agendar consulta", icon: <CalendarDays />, onSelect: () => setTab("consultas") },
                { label: "Excluir paciente", icon: <Trash2 />, danger: true, separatorBefore: true, onSelect: () => setConfirmDelete(true) },
              ]}
            />
          </div>
        </div>
      </Card>

      <Tabs items={tabs} value={activeTab} onChange={setTab} label="Seções do paciente" className="mb-5" />

      <div role="tabpanel" className="animate-fade-in" key={activeTab}>
        {activeTab === "resumo" ? <SummaryTab overview={overview} /> : null}
        {activeTab === "consultas" ? <AppointmentsTab patientId={patient.id} /> : null}
        {activeTab === "prontuario" ? <ClinicalRecordPanel patientId={patient.id} /> : null}
        {activeTab === "tratamentos" ? <PlansTab patient={patient} /> : null}
        {activeTab === "financeiro" ? <FinanceTab patientId={patient.id} /> : null}
        {activeTab === "documentos" ? <DocumentsPanel patientId={patient.id} /> : null}
        {activeTab === "fotos" ? <PhotosTab patientId={patient.id} /> : null}
        {activeTab === "historico" ? <HistoryTab patientId={patient.id} /> : null}
      </div>

      <PatientFormDialog open={editOpen} onClose={() => setEditOpen(false)} patient={patient} />
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Excluir paciente?"
        description={`O cadastro de ${patient.name} será removido. Consultas e lançamentos financeiros permanecem para fins de histórico.`}
        onConfirm={async () => {
          await patientService.remove(patient.id);
          toast.success("Paciente excluído");
          router.replace("/admin/pacientes");
        }}
      />
    </div>
  );
}
