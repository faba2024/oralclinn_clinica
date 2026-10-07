"use client";

import { AlertCircle, CalendarClock } from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { AppointmentStatusBadge } from "@/features/appointments/components/status-badge";
import { usePatientAppointments } from "@/features/appointments/hooks";
import { usePatientPlans } from "@/features/budgets/hooks";
import { planTotals } from "@/features/budgets/service";
import { PLAN_STATUS } from "@/features/budgets/types";
import { useLookups } from "@/hooks/use-lookups";
import { formatCurrency, formatDate } from "@/utils/format";
import type { PatientOverview } from "../../types";

export function SummaryTab({ overview }: { overview: PatientOverview }) {
  const { patient } = overview;
  const lookups = useLookups();
  const { data: plans = [] } = usePatientPlans(patient.id);
  const { data: appointments = [] } = usePatientAppointments(patient.id);
  const active = plans.filter((p) => p.status === "aprovado" || p.status === "em-andamento");
  const recent = appointments.slice(0, 5);

  return (
    <div className="space-y-4">
      {patient.importantNotes ? (
        <div className="flex items-start gap-3 rounded-[12px] border border-warning/25 bg-warning-soft px-4 py-3">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-warning" />
          <div>
            <p className="text-[13px] font-semibold text-[#7a5520]">Observações importantes</p>
            <p className="mt-0.5 text-[13px] leading-relaxed text-[#7a5520]">{patient.importantNotes}</p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Tratamentos ativos" value={active.length} hint={active[0]?.title} />
        <StatCard label="Valor investido" value={formatCurrency(overview.totalSpent)} hint="parcelas recebidas" />
        <StatCard label="Saldo pendente" value={formatCurrency(overview.pendingBalance)} hint="a vencer e em atraso" />
        <StatCard
          label="Próxima consulta"
          value={overview.nextAppointment ? formatDate(overview.nextAppointment.date, "dd/MM") : "—"}
          hint={overview.nextAppointment ? `às ${overview.nextAppointment.start}` : "Nenhuma agendada"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Últimas consultas" />
          <CardBody className="pt-3">
            {recent.length === 0 ? (
              <EmptyState compact icon={<CalendarClock />} title="Sem consultas registradas" />
            ) : (
              <ul className="divide-y divide-line">
                {recent.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 py-2.5">
                    <div className="w-14 shrink-0">
                      <p className="text-[13px] font-semibold tabular">{formatDate(a.date, "dd/MM")}</p>
                      <p className="text-[11.5px] tabular text-subtle">{a.start}</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-medium">{lookups.treatmentName(a.treatmentId)}</p>
                      <p className="truncate text-[12px] text-subtle">{lookups.professionalName(a.professionalId)}</p>
                    </div>
                    <AppointmentStatusBadge status={a.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Planos de tratamento" />
          <CardBody className="pt-3">
            {plans.length === 0 ? (
              <EmptyState compact title="Nenhum plano criado" description="Crie um plano na aba Tratamentos." />
            ) : (
              <ul className="divide-y divide-line">
                {plans.map((p) => (
                  <li key={p.id}>
                    <Link href={`/admin/orcamentos/${p.id}`} className="flex items-center gap-3 py-2.5 transition-colors hover:text-gold-dark">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-medium">{p.title}</p>
                        <p className="text-[12px] text-subtle">
                          {p.code} · {formatDate(p.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[13px] font-semibold tabular">{formatCurrency(planTotals(p).total)}</p>
                        <Badge tone={PLAN_STATUS[p.status].tone}>{PLAN_STATUS[p.status].label}</Badge>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
