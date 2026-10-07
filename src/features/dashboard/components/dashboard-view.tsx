"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowUpRight,
  CalendarCheck,
  CalendarPlus,
  Cake,
  CircleDollarSign,
  Clock,
  UserPlus,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { DonutChart, Legend } from "@/components/charts/donut-chart";
import { Funnel } from "@/components/charts/funnel";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { SimpleBarChart } from "@/components/charts/simple-bar-chart";
import { CHART_COLORS } from "@/components/charts/chart-theme";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { Skeleton, SkeletonRows } from "@/components/ui/skeleton";
import { AppointmentStatusBadge } from "@/features/appointments/components/status-badge";
import { planTotals } from "@/features/budgets/service";
import { PLAN_STATUS } from "@/features/budgets/types";
import { LEAD_STAGE_LABELS } from "@/features/crm/types";
import { canAccess } from "@/features/users/permissions";
import { useLookups } from "@/hooks/use-lookups";
import { useAuthStore } from "@/stores/auth-store";
import { LEAD_SOURCE_LABELS } from "@/types/labels";
import { cn } from "@/utils/cn";
import { endTime } from "@/utils/dates";
import { firstName, formatCurrency, formatDate, formatPercent, formatRelative } from "@/utils/format";
import { useDashboard } from "../hooks";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

function trend(current: number, previous: number) {
  if (!previous) return null;
  return { value: (current - previous) / previous };
}

export function DashboardView() {
  const user = useAuthStore((s) => s.user);
  const { data, loading } = useDashboard();
  const lookups = useLookups();
  const can = (m: Parameters<typeof canAccess>[1]) => canAccess(user?.role, m);
  const showFinance = can("financeiro") || user?.role === "admin";

  const sourceData = useMemo(
    () => (data?.leadSources ?? []).map((s) => ({ name: s.label, value: s.leads })),
    [data?.leadSources],
  );
  const bestSource = useMemo(() => {
    const rows = (data?.leadSources ?? []).filter((s) => s.won > 0);
    return rows.sort((a, b) => b.conversion - a.conversion || b.value - a.value)[0];
  }, [data?.leadSources]);

  const k = data?.kpis;
  const now = new Date();
  const dateLabel = format(now, "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`${greeting()}, ${firstName(user?.name.replace(/^(Dra?\.)\s+/, "") ?? "")}`}
        description={<span className="cap-first">{dateLabel}</span>}
        actions={
          <>
            {can("pacientes") ? (
              <Link href="/admin/pacientes?novo=1" className={buttonVariants({ variant: "secondary" })}>
                <UserPlus /> Novo paciente
              </Link>
            ) : null}
            {can("agenda") ? (
              <Link href="/admin/agenda?nova=1" className={buttonVariants({ variant: "primary" })}>
                <CalendarPlus /> Nova consulta
              </Link>
            ) : null}
          </>
        }
      />

      <section aria-label="Indicadores" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          emphasis
          label="Consultas hoje"
          icon={<CalendarCheck />}
          loading={loading}
          value={k?.appointmentsToday ?? 0}
          hint={k ? `${k.confirmedToday} confirmadas` : undefined}
        />
        {showFinance ? (
          <StatCard
            label="Faturamento do mês"
            icon={<CircleDollarSign />}
            loading={loading}
            value={formatCurrency(k?.revenueMonth ?? 0)}
            trend={k ? trend(k.revenueMonth, k.revenuePrevMonth) : null}
            hint="vs. mesmo período"
          />
        ) : (
          <StatCard label="Leads em aberto" icon={<UserPlus />} loading={loading} value={k?.openLeads ?? 0} hint="no funil comercial" />
        )}
        {showFinance ? (
          <StatCard
            label="A receber"
            icon={<Wallet />}
            loading={loading}
            value={formatCurrency(k?.receivable ?? 0)}
            hint={k ? `${formatCurrency(k.overdue)} em atraso` : undefined}
          />
        ) : (
          <StatCard label="Tratamentos ativos" icon={<Wallet />} loading={loading} value={k?.activeTreatments ?? 0} hint="planos aprovados" />
        )}
        <StatCard
          label="Novos pacientes"
          icon={<UserPlus />}
          loading={loading}
          value={k?.newPatientsMonth ?? 0}
          trend={k ? trend(k.newPatientsMonth, k.newPatientsPrevMonth) : null}
          hint="últimos 30 dias"
        />
      </section>

      {k ? (
        <div className="mt-3 grid grid-cols-2 divide-line rounded-[14px] border border-line bg-white text-[12.5px] sm:grid-cols-4 sm:divide-x">
          {[
            { label: "Leads em aberto", value: String(k.openLeads), href: "/admin/crm" },
            { label: "Tratamentos ativos", value: String(k.activeTreatments), href: "/admin/orcamentos" },
            ...(showFinance ? [{ label: "Inadimplência", value: formatPercent(k.delinquencyRate, 1), href: "/admin/financeiro" }] : [{ label: "Consultas nos próximos 7 dias", value: String(data?.upcoming.length ?? 0), href: "/admin/agenda" }]),
            { label: "Taxa de confirmação hoje", value: k.appointmentsToday ? formatPercent(k.confirmedToday / k.appointmentsToday) : "—", href: "/admin/agenda" },
          ].map((m) => (
            <Link key={m.label} href={m.href} className="group flex items-center justify-between gap-2 px-4 py-3 transition-colors hover:bg-ivory">
              <span className="text-muted">{m.label}</span>
              <span className="flex items-center gap-1 font-semibold tabular text-ink">
                {m.value}
                <ArrowUpRight className="size-3 text-subtle opacity-0 transition-opacity group-hover:opacity-100" />
              </span>
            </Link>
          ))}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        {showFinance ? (
          <Card className="xl:col-span-2">
            <CardHeader
              title="Faturamento mensal"
              description="Receitas recebidas e despesas nos últimos 6 meses"
              action={
                <div className="hidden items-center gap-3 text-[11.5px] text-muted sm:flex">
                  <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 rounded bg-gold" /> Receita</span>
                  <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 rounded border-t border-dashed border-ink" /> Despesa</span>
                </div>
              }
            />
            <CardBody className="pt-3">{data ? <RevenueChart data={data.revenueSeries} /> : <Skeleton className="h-[260px] w-full" />}</CardBody>
          </Card>
        ) : null}

        <Card className={cn(!showFinance && "xl:col-span-3")}>
          <CardHeader
            title="Agenda de hoje"
            description={data ? `${data.today.length} horários` : undefined}
            action={
              <Link href="/admin/agenda" className="text-[12.5px] font-medium text-gold-dark hover:underline">
                Abrir agenda
              </Link>
            }
          />
          <CardBody className="pt-3">
            {!data ? (
              <SkeletonRows rows={5} />
            ) : data.today.length === 0 ? (
              <EmptyState compact icon={<Clock />} title="Nenhuma consulta hoje" description="Os horários agendados aparecerão aqui." />
            ) : (
              <ol className="relative space-y-1">
                {data.today.map((a) => (
                  <li key={a.id}>
                    <Link
                      href={`/admin/agenda?data=${a.date}&consulta=${a.id}`}
                      className="group flex items-center gap-3 rounded-[10px] px-2 py-2 transition-colors hover:bg-ivory"
                    >
                      <span className="w-11 shrink-0 text-right">
                        <span className="block text-[13px] font-semibold tabular">{a.start}</span>
                        <span className="block text-[11px] tabular text-subtle">{endTime(a.start, a.duration)}</span>
                      </span>
                      <span className="h-8 w-[3px] shrink-0 rounded-full" style={{ backgroundColor: lookups.professional(a.professionalId)?.color ?? CHART_COLORS.sand }} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-medium">{a.patientName}</span>
                        <span className="block truncate text-[12px] text-subtle">
                          {lookups.treatmentName(a.treatmentId)} · {lookups.professional(a.professionalId)?.name.split(" ")[0]}
                        </span>
                      </span>
                      <span className="hidden sm:block">
                        <AppointmentStatusBadge status={a.status} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Origem dos leads" description={bestSource ? `Mais eficiente: ${bestSource.label} (${formatPercent(bestSource.conversion)} de conversão)` : "Distribuição por canal"} />
          <CardBody className="grid grid-cols-[1fr_1.1fr] items-center gap-4 pt-3">
            {data ? (
              <>
                <DonutChart data={sourceData} label="Origem dos leads" centerValue={String(sourceData.reduce((s, d) => s + d.value, 0))} centerLabel="leads" height={170} />
                <Legend items={sourceData.slice(0, 6).map((s) => ({ name: s.name, value: String(s.value) }))} />
              </>
            ) : (
              <Skeleton className="col-span-2 h-[170px]" />
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Conversão comercial" description="Do primeiro contato ao fechamento" />
          <CardBody className="pt-4">{data ? <Funnel steps={data.funnel} /> : <Skeleton className="h-[170px]" />}</CardBody>
        </Card>
        <Card>
          <CardHeader title="Novos pacientes" description="Cadastros por mês" />
          <CardBody className="pt-3">
            {data ? (
              <SimpleBarChart label="Novos pacientes por mês" data={data.newPatientsSeries} xKey="label" series={[{ key: "pacientes", name: "Pacientes", color: CHART_COLORS.primary }]} height={190} />
            ) : (
              <Skeleton className="h-[190px]" />
            )}
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader title="Consultas por dia da semana" description="Últimos 30 dias — realizadas e faltas/cancelamentos" />
          <CardBody className="pt-3">
            {data ? (
              <SimpleBarChart
                label="Consultas por dia da semana"
                data={data.appointmentsByWeekday}
                xKey="label"
                series={[
                  { key: "realizadas", name: "Realizadas", color: CHART_COLORS.primary, stackId: "a" },
                  { key: "faltas", name: "Faltas e cancelamentos", color: CHART_COLORS.champagne, stackId: "a" },
                ]}
                height={220}
              />
            ) : (
              <Skeleton className="h-[220px]" />
            )}
          </CardBody>
        </Card>
        {showFinance ? (
          <Card className="lg:col-span-2">
            <CardHeader
              title="Pagamentos pendentes"
              action={<Link href="/admin/financeiro?aba=parcelas" className="text-[12.5px] font-medium text-gold-dark hover:underline">Ver todos</Link>}
            />
            <CardBody className="pt-3">
              {!data ? (
                <SkeletonRows rows={4} />
              ) : (
                <ul className="divide-y divide-line">
                  {data.pendingPayments.map((p) => (
                    <li key={p.id} className="flex items-center gap-3 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-medium">{lookups.patientName(p.patientId)}</p>
                        <p className="truncate text-[12px] text-subtle">
                          {p.description} · {p.number}/{p.totalInstallments}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[13.5px] font-semibold tabular">{formatCurrency(p.amount)}</p>
                        <p className={cn("text-[11.5px] tabular", p.status === "atrasado" ? "text-danger" : "text-subtle")}>
                          {p.status === "atrasado" ? "Venceu " : "Vence "}
                          {formatDate(p.dueDate, "dd/MM")}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        ) : null}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Leads recentes" action={<Link href="/admin/crm" className="text-[12.5px] font-medium text-gold-dark hover:underline">CRM</Link>} />
          <CardBody className="pt-3">
            {!data ? (
              <SkeletonRows rows={4} />
            ) : (
              <ul className="space-y-1">
                {data.recentLeads.map((l) => (
                  <li key={l.id}>
                    <Link href={`/admin/crm?lead=${l.id}`} className="flex items-center gap-3 rounded-[10px] px-2 py-2 transition-colors hover:bg-ivory">
                      <Avatar name={l.name} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-medium">{l.name}</span>
                        <span className="block truncate text-[12px] text-subtle">
                          {l.interest} · {LEAD_SOURCE_LABELS[l.source]}
                        </span>
                      </span>
                      <span className="text-right">
                        <Badge tone={l.stage === "fechado" ? "success" : l.stage === "perdido" ? "danger" : "neutral"}>{LEAD_STAGE_LABELS[l.stage]}</Badge>
                        <span className="mt-1 block text-[11px] text-subtle">{formatRelative(l.createdAt)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Tratamentos em andamento" description="Planos aprovados e em execução" />
          <CardBody className="pt-3">
            {!data ? (
              <SkeletonRows rows={4} />
            ) : data.activePlans.length === 0 ? (
              <EmptyState compact title="Nenhum tratamento ativo" />
            ) : (
              <ul className="space-y-3.5">
                {data.activePlans.slice(0, 5).map(({ plan: p, paidRatio }) => {
                  return (
                    <li key={p.id}>
                      <Link href={`/admin/orcamentos/${p.id}`} className="block rounded-[10px] transition-colors">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="truncate text-[13.5px] font-medium">{lookups.patientName(p.patientId)}</span>
                          <span className="shrink-0 text-[12px] font-semibold tabular">{formatCurrency(planTotals(p).total)}</span>
                        </div>
                        <p className="mb-1.5 truncate text-[12px] text-subtle">
                          {p.title} · {PLAN_STATUS[p.status].label} · {formatPercent(paidRatio)} pago
                        </p>
                        <Progress value={paidRatio} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Aniversariantes" description="Próximos 14 dias" />
          <CardBody className="pt-3">
            {!data ? (
              <SkeletonRows rows={3} />
            ) : data.birthdays.length === 0 ? (
              <EmptyState compact icon={<Cake />} title="Nenhum aniversário próximo" />
            ) : (
              <ul className="space-y-1">
                {data.birthdays.map((b) => (
                  <li key={b.patient.id}>
                    <Link href={`/admin/pacientes/${b.patient.id}`} className="flex items-center gap-3 rounded-[10px] px-2 py-2 transition-colors hover:bg-ivory">
                      <span className={cn("flex size-8 items-center justify-center rounded-full", b.isToday ? "bg-gold text-white" : "bg-gold-soft text-gold-dark")}>
                        <Cake className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-medium">{b.patient.name}</span>
                        <span className="block text-[12px] text-subtle">{b.isToday ? "Hoje" : formatDate(b.date, "EEEE, dd/MM")}</span>
                      </span>
                      {b.isToday ? <Badge tone="gold">Hoje</Badge> : null}
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
