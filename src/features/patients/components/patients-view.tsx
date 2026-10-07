"use client";

import { Download, Search, UserPlus, Users } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Select } from "@/components/ui/input";
import { SkeletonRows } from "@/components/ui/skeleton";
import { Segmented } from "@/components/ui/tabs";
import { useDebounce } from "@/hooks/use-debounce";
import { useLookups } from "@/hooks/use-lookups";
import { calculateAge, formatCpf, formatCurrency, formatDate, formatPhone, matchesSearch } from "@/utils/format";
import { usePatientOverviews } from "../hooks";
import { PATIENT_STATUS_LABELS, type PatientOverview, type PatientStatus } from "../types";
import { PatientFormDialog } from "./patient-form-dialog";
import { PatientStatusBadge } from "./patient-status-badge";

type StatusFilter = PatientStatus | "todos";

export function PatientsView() {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();
  const lookups = useLookups();
  const { data, loading } = usePatientOverviews();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("todos");
  const [professional, setProfessional] = useState("");
  const [formOpen, setFormOpen] = useState(() => params.get("novo") === "1");
  const search = useDebounce(query, 120);

  useEffect(() => {
    if (params.get("novo")) router.replace(pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = useMemo(
    () =>
      (data ?? []).filter(
        ({ patient: p }) =>
          (status === "todos" || p.status === status) &&
          (!professional || p.responsibleProfessionalId === professional) &&
          matchesSearch(search, p.name, p.phone, p.cpf, p.email),
      ),
    [data, status, professional, search],
  );

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = { todos: 0, novo: 0, ativo: 0, "em-tratamento": 0, inativo: 0 };
    (data ?? []).forEach(({ patient }) => {
      c.todos += 1;
      c[patient.status] += 1;
    });
    return c;
  }, [data]);

  const exportCsv = () => {
    const header = ["Nome", "Telefone", "E-mail", "CPF", "Nascimento", "Status", "Valor gasto"];
    const lines = rows.map(({ patient: p, totalSpent }) =>
      [p.name, formatPhone(p.phone), p.email, formatCpf(p.cpf), formatDate(p.birthDate), PATIENT_STATUS_LABELS[p.status], totalSpent.toFixed(2)].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";"),
    );
    const blob = new Blob([`﻿${[header.join(";"), ...lines].join("\n")}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pacientes-oralclin.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns: Column<PatientOverview>[] = [
    {
      key: "name",
      header: "Paciente",
      sortValue: (r) => r.patient.name,
      cell: ({ patient: p }) => (
        <div className="flex min-w-[200px] items-center gap-3">
          <Avatar name={p.name} src={p.photo} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{p.name}</p>
            <p className="truncate text-[12px] text-subtle">{p.email || "Sem e-mail"}</p>
          </div>
        </div>
      ),
    },
    { key: "phone", header: "Telefone", cell: ({ patient: p }) => <span className="whitespace-nowrap tabular text-ink-2">{formatPhone(p.phone)}</span> },
    { key: "cpf", header: "CPF", cell: ({ patient: p }) => <span className="whitespace-nowrap tabular text-muted">{formatCpf(p.cpf)}</span> },
    {
      key: "birth",
      header: "Nascimento",
      sortValue: (r) => r.patient.birthDate || "9999",
      cell: ({ patient: p }) =>
        p.birthDate ? (
          <span className="whitespace-nowrap tabular text-ink-2">
            {formatDate(p.birthDate)} <span className="text-subtle">· {calculateAge(p.birthDate)}a</span>
          </span>
        ) : (
          <span className="text-subtle">—</span>
        ),
    },
    {
      key: "last",
      header: "Última consulta",
      sortValue: (r) => r.lastAppointment?.date ?? "",
      cell: (r) => <span className="whitespace-nowrap tabular text-ink-2">{r.lastAppointment ? formatDate(r.lastAppointment.date) : "—"}</span>,
    },
    {
      key: "next",
      header: "Próxima consulta",
      sortValue: (r) => r.nextAppointment?.date ?? "9999",
      cell: (r) =>
        r.nextAppointment ? (
          <span className="whitespace-nowrap tabular font-medium text-ink">
            {formatDate(r.nextAppointment.date, "dd/MM")} <span className="font-normal text-subtle">{r.nextAppointment.start}</span>
          </span>
        ) : (
          <span className="text-subtle">—</span>
        ),
    },
    { key: "treatment", header: "Tratamento", cell: (r) => <span className="block max-w-[180px] truncate text-ink-2">{r.currentTreatment ?? "—"}</span> },
    {
      key: "resp",
      header: "Responsável",
      cell: ({ patient: p }) => <span className="whitespace-nowrap text-ink-2">{p.responsibleProfessionalId ? lookups.professionalName(p.responsibleProfessionalId) : "—"}</span>,
    },
    { key: "status", header: "Status", sortValue: (r) => r.patient.status, cell: ({ patient: p }) => <PatientStatusBadge status={p.status} /> },
    {
      key: "spent",
      header: "Valor gasto",
      align: "right",
      sortValue: (r) => r.totalSpent,
      cell: (r) => <span className="whitespace-nowrap font-medium tabular">{formatCurrency(r.totalSpent)}</span>,
    },
  ];

  const filters: { value: StatusFilter; label: string }[] = [
    { value: "todos", label: `Todos ${counts.todos}` },
    { value: "em-tratamento", label: `Em tratamento ${counts["em-tratamento"]}` },
    { value: "ativo", label: `Ativos ${counts.ativo}` },
    { value: "novo", label: `Novos ${counts.novo}` },
    { value: "inativo", label: `Inativos ${counts.inativo}` },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Pacientes"
        description="Cadastro, histórico e relacionamento com cada paciente."
        actions={
          <>
            <Button variant="secondary" onClick={exportCsv} disabled={!rows.length}>
              <Download /> Exportar
            </Button>
            <Button onClick={() => setFormOpen(true)}>
              <UserPlus /> Novo paciente
            </Button>
          </>
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line p-3 sm:p-4 xl:flex-row xl:items-center">
          <div className="w-full xl:max-w-xs">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome, telefone, CPF ou e-mail"
              leading={<Search />}
              aria-label="Buscar pacientes"
            />
          </div>
          <div className="scrollbar-thin -mx-1 overflow-x-auto px-1">
            <Segmented label="Filtrar por status" size="sm" options={filters} value={status} onChange={setStatus} />
          </div>
          <div className="xl:ml-auto xl:w-56">
            <Select value={professional} onChange={(e) => setProfessional(e.target.value)} aria-label="Filtrar por profissional">
              <option value="">Todos os profissionais</option>
              {lookups.professionals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} {p.name}
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
            caption="Lista de pacientes"
            rows={rows}
            columns={columns}
            getRowId={(r) => r.patient.id}
            onRowClick={(r) => router.push(`/admin/pacientes/${r.patient.id}`)}
            pageSize={10}
            initialSort={{ key: "name", dir: "asc" }}
            empty={
              <EmptyState
                icon={<Users />}
                title={query || status !== "todos" || professional ? "Nenhum paciente encontrado" : "Nenhum paciente cadastrado"}
                description={query ? "Revise os termos da busca ou os filtros aplicados." : "Cadastre o primeiro paciente para começar."}
                action={
                  <Button variant="secondary" onClick={() => setFormOpen(true)}>
                    <UserPlus /> Novo paciente
                  </Button>
                }
              />
            }
            mobileCard={(r) => (
              <div className="flex items-center gap-3">
                <Avatar name={r.patient.name} src={r.patient.photo} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium">{r.patient.name}</p>
                  <p className="truncate text-[12px] text-subtle">
                    {formatPhone(r.patient.phone)}
                    {r.nextAppointment ? ` · Próx. ${formatDate(r.nextAppointment.date, "dd/MM")}` : ""}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <PatientStatusBadge status={r.patient.status} />
                  <span className="text-[12px] font-medium tabular text-ink-2">{formatCurrency(r.totalSpent)}</span>
                </div>
              </div>
            )}
          />
        )}
      </Card>

      <PatientFormDialog open={formOpen} onClose={() => setFormOpen(false)} onSaved={(p) => router.push(`/admin/pacientes/${p.id}`)} />
    </div>
  );
}
