"use client";

import { addDays, format } from "date-fns";
import { FilePlus2, FileText, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Select } from "@/components/ui/input";
import { SkeletonRows } from "@/components/ui/skeleton";
import { useLookups } from "@/hooks/use-lookups";
import { useAuthStore } from "@/stores/auth-store";
import { todayISO } from "@/utils/dates";
import { formatCurrency, formatDate, formatPercent, formatPhone, matchesSearch } from "@/utils/format";
import { usePlans } from "../hooks";
import { budgetService, planTotals } from "../service";
import { PLAN_STATUS, PLAN_STATUSES, type PlanStatus, type TreatmentPlan } from "../types";
import { PlanStatusBadge } from "./plan-status-badge";

export function BudgetsView() {
  const router = useRouter();
  const lookups = useLookups();
  const user = useAuthStore((s) => s.user);
  const { data, loading } = usePlans();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<PlanStatus | "">("");
  const [newOpen, setNewOpen] = useState(false);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [professionalId, setProfessionalId] = useState("");
  const [creating, setCreating] = useState(false);

  const rows = useMemo(
    () =>
      (data ?? []).filter(
        (p) => (!status || p.status === status) && matchesSearch(query, p.code, p.title, lookups.patientName(p.patientId)),
      ),
    [data, status, query, lookups],
  );

  const stats = useMemo(() => {
    const all = data ?? [];
    const sent = all.filter((p) => p.status !== "rascunho");
    const approved = all.filter((p) => ["aprovado", "em-andamento", "concluido"].includes(p.status));
    const open = all.filter((p) => p.status === "enviado");
    return {
      openValue: open.reduce((s, p) => s + planTotals(p).total, 0),
      approvedValue: approved.reduce((s, p) => s + planTotals(p).total, 0),
      rate: sent.length ? approved.length / sent.length : 0,
      expiring: open.filter((p) => p.validUntil >= todayISO() && p.validUntil <= format(addDays(new Date(), 7), "yyyy-MM-dd")).length,
    };
  }, [data]);

  const create = async () => {
    if (!patientId) return;
    setCreating(true);
    try {
      const plan = await budgetService.createDraft(patientId, professionalId || user?.professionalId || lookups.professionals[0]?.id || "");
      router.push(`/admin/orcamentos/${plan.id}`);
    } finally {
      setCreating(false);
    }
  };

  const columns: Column<TreatmentPlan>[] = [
    { key: "code", header: "Código", sortValue: (p) => p.code, cell: (p) => <span className="font-semibold tabular text-gold-dark">{p.code}</span> },
    {
      key: "patient",
      header: "Paciente",
      sortValue: (p) => lookups.patientName(p.patientId),
      cell: (p) => (
        <div className="flex min-w-[180px] items-center gap-2.5">
          <Avatar name={lookups.patientName(p.patientId)} size="xs" />
          <span className="truncate font-medium">{lookups.patientName(p.patientId)}</span>
        </div>
      ),
    },
    { key: "title", header: "Plano", cell: (p) => <span className="block max-w-[240px] truncate text-ink-2">{p.title}</span> },
    { key: "prof", header: "Profissional", cell: (p) => <span className="whitespace-nowrap text-muted">{lookups.professionalName(p.professionalId)}</span> },
    { key: "date", header: "Criado em", sortValue: (p) => p.createdAt, cell: (p) => <span className="tabular text-muted">{formatDate(p.createdAt)}</span> },
    { key: "valid", header: "Validade", sortValue: (p) => p.validUntil, cell: (p) => <span className="tabular text-muted">{formatDate(p.validUntil)}</span> },
    { key: "status", header: "Status", sortValue: (p) => p.status, cell: (p) => <PlanStatusBadge status={p.status} /> },
    { key: "total", header: "Total", align: "right", sortValue: (p) => planTotals(p).total, cell: (p) => <span className="font-semibold tabular">{formatCurrency(planTotals(p).total)}</span> },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Orçamentos"
        description="Planos de tratamento, propostas e aprovações."
        actions={
          <Button onClick={() => setNewOpen(true)}>
            <FilePlus2 /> Novo orçamento
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Propostas em aberto" value={formatCurrency(stats.openValue)} hint="aguardando decisão" />
        <StatCard label="Valor aprovado" value={formatCurrency(stats.approvedValue)} hint="aprovados e em andamento" />
        <StatCard label="Taxa de aprovação" value={formatPercent(stats.rate)} hint="das propostas enviadas" />
        <StatCard label="Total de planos" value={(data ?? []).length} hint={`${stats.expiring} vencem esta semana`} />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line p-3 sm:flex-row sm:p-4">
          <div className="sm:w-80">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por código, paciente ou plano" leading={<Search />} aria-label="Buscar orçamentos" />
          </div>
          <div className="sm:w-52">
            <Select value={status} onChange={(e) => setStatus(e.target.value as PlanStatus | "")} aria-label="Filtrar por status">
              <option value="">Todos os status</option>
              {PLAN_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {PLAN_STATUS[s].label}
                </option>
              ))}
            </Select>
          </div>
        </div>
        {loading && !data ? (
          <div className="p-5">
            <SkeletonRows rows={6} />
          </div>
        ) : (
          <DataTable
            caption="Orçamentos"
            rows={rows}
            columns={columns}
            getRowId={(p) => p.id}
            onRowClick={(p) => router.push(`/admin/orcamentos/${p.id}`)}
            initialSort={{ key: "date", dir: "desc" }}
            empty={<EmptyState icon={<FileText />} title="Nenhum orçamento encontrado" description="Crie um orçamento a partir de um paciente." />}
            mobileCard={(p) => (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-medium">{lookups.patientName(p.patientId)}</p>
                  <p className="truncate text-[12px] text-subtle">
                    {p.code} · {p.title}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[13px] font-semibold tabular">{formatCurrency(planTotals(p).total)}</span>
                  <PlanStatusBadge status={p.status} />
                </div>
              </div>
            )}
          />
        )}
      </Card>

      <Dialog
        open={newOpen}
        onClose={() => setNewOpen(false)}
        size="sm"
        title="Novo orçamento"
        description="Escolha o paciente para iniciar o plano de tratamento."
        footer={
          <>
            <Button variant="secondary" onClick={() => setNewOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={create} loading={creating} disabled={!patientId}>
              Criar e editar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Paciente" htmlFor="nb-patient" required>
            <Combobox
              id="nb-patient"
              value={patientId}
              onChange={setPatientId}
              placeholder="Selecionar paciente"
              options={lookups.patients.map((p) => ({ value: p.id, label: p.name, description: formatPhone(p.phone), leading: <Avatar name={p.name} size="xs" /> }))}
            />
          </Field>
          <Field label="Profissional" htmlFor="nb-prof">
            <Select id="nb-prof" value={professionalId} onChange={(e) => setProfessionalId(e.target.value)}>
              <option value="">Definir depois</option>
              {lookups.professionals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} {p.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Dialog>
    </div>
  );
}
