import { addDays, endOfMonth, format, getDay, parseISO, startOfMonth, subDays, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { repositories } from "@/repositories";
import { INACTIVE_STATUSES } from "@/features/appointments/service";
import type { Appointment } from "@/features/appointments/types";
import { sourcePerformance, type SourcePerformance } from "@/features/crm/service";
import type { Lead } from "@/features/crm/types";
import { flattenInstallments, monthlySeries, type MonthlyPoint } from "@/features/finance/service";
import type { InstallmentRow } from "@/features/finance/types";
import type { Patient } from "@/features/patients/types";
import type { TreatmentPlan } from "@/features/budgets/types";
import { todayISO } from "@/utils/dates";

export interface DashboardData {
  today: Appointment[];
  upcoming: Appointment[];
  kpis: {
    appointmentsToday: number;
    confirmedToday: number;
    newPatientsMonth: number;
    newPatientsPrevMonth: number;
    openLeads: number;
    revenueMonth: number;
    revenuePrevMonth: number;
    receivable: number;
    overdue: number;
    delinquencyRate: number;
    activeTreatments: number;
  };
  revenueSeries: MonthlyPoint[];
  newPatientsSeries: { label: string; pacientes: number }[];
  leadSources: SourcePerformance[];
  funnel: { stage: string; value: number }[];
  appointmentsByWeekday: { label: string; realizadas: number; faltas: number }[];
  pendingPayments: InstallmentRow[];
  recentLeads: Lead[];
  birthdays: { patient: Patient; date: string; isToday: boolean }[];
  activePlans: { plan: TreatmentPlan; paidRatio: number }[];
}

export async function getDashboardData(): Promise<DashboardData> {
  const [appointments, patients, leads, receivables, expenses, plans] = await Promise.all([
    repositories.appointments.list(),
    repositories.patients.list(),
    repositories.leads.list(),
    repositories.receivables.list(),
    repositories.expenses.list(),
    repositories.plans.list(),
  ]);

  const today = todayISO();
  const now = new Date();
  const monthStart = format(startOfMonth(now), "yyyy-MM-dd");
  const prevStart = format(startOfMonth(subMonths(now, 1)), "yyyy-MM-dd");
  // Comparação justa: mês anterior até o mesmo dia.
  const prevSameDay = format(subMonths(now, 1), "yyyy-MM-dd");

  const todayList = appointments.filter((a) => a.date === today).sort((a, b) => a.start.localeCompare(b.start));
  const upcoming = appointments
    .filter((a) => a.date > today && a.date <= format(addDays(now, 7), "yyyy-MM-dd") && !INACTIVE_STATUSES.includes(a.status))
    .sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`));

  const rows = flattenInstallments(receivables);
  const paidIn = (from: string, to: string) => rows.filter((r) => r.paidAt && r.paidAt >= from && r.paidAt <= to).reduce((s, r) => s + r.amount, 0);
  const open = rows.filter((r) => !r.paidAt);
  const receivable = open.reduce((s, r) => s + r.amount, 0);
  const overdue = open.filter((r) => r.status === "atrasado").reduce((s, r) => s + r.amount, 0);
  const dueSoFar = rows.filter((r) => r.dueDate <= today).reduce((s, r) => s + r.amount, 0);

  const createdIn = (p: { createdAt: string }, from: string, to: string) => {
    const d = p.createdAt.slice(0, 10);
    return d >= from && d <= to;
  };

  const newPatientsSeries = Array.from({ length: 6 }, (_, i) => {
    const month = subMonths(now, 5 - i);
    const from = format(startOfMonth(month), "yyyy-MM-dd");
    const to = format(endOfMonth(month), "yyyy-MM-dd");
    const label = format(month, "MMM", { locale: ptBR }).replace(".", "");
    return { label: label.charAt(0).toUpperCase() + label.slice(1), pacientes: patients.filter((p) => createdIn(p, from, to)).length };
  });

  const stageOrder = ["novo", "contato", "avaliacao-agendada", "compareceu", "proposta", "negociacao", "fechado"] as const;
  const reached = (stage: (typeof stageOrder)[number]) =>
    leads.filter((l) => l.stage !== "perdido" && stageOrder.indexOf(l.stage as (typeof stageOrder)[number]) >= stageOrder.indexOf(stage)).length +
    (stage === "novo" ? leads.filter((l) => l.stage === "perdido").length : 0);
  const funnel = [
    { stage: "Leads", value: reached("novo") },
    { stage: "Contato", value: reached("contato") },
    { stage: "Avaliação", value: reached("avaliacao-agendada") },
    { stage: "Proposta", value: reached("proposta") },
    { stage: "Fechados", value: reached("fechado") },
  ];

  const last30 = format(subDays(now, 30), "yyyy-MM-dd");
  const weekdayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const byWeekday = [1, 2, 3, 4, 5, 6].map((wd) => {
    const items = appointments.filter((a) => a.date >= last30 && a.date < today && getDay(parseISO(a.date)) === wd);
    return {
      label: weekdayLabels[wd],
      realizadas: items.filter((a) => a.status === "finalizada").length,
      faltas: items.filter((a) => a.status === "faltou" || a.status === "cancelada").length,
    };
  });

  const birthdays = patients
    .filter((p) => p.birthDate && p.status !== "inativo")
    .map((p) => {
      const mmdd = p.birthDate.slice(5);
      let date = `${now.getFullYear()}-${mmdd}`;
      if (date < today) date = `${now.getFullYear() + 1}-${mmdd}`;
      return { patient: p, date, isToday: date === today };
    })
    .filter((b) => b.date <= format(addDays(now, 14), "yyyy-MM-dd"))
    .sort((a, b) => a.date.localeCompare(b.date));

  const activePlans = plans
    .filter((p) => p.status === "em-andamento" || p.status === "aprovado")
    .map((plan) => {
      const linked = rows.filter((r) => receivables.find((rc) => rc.id === r.receivableId)?.planId === plan.id);
      const total = linked.reduce((s, r) => s + r.amount, 0);
      const paid = linked.filter((r) => r.paidAt).reduce((s, r) => s + r.amount, 0);
      return { plan, paidRatio: total ? paid / total : 0 };
    });

  return {
    today: todayList,
    upcoming,
    kpis: {
      appointmentsToday: todayList.filter((a) => !INACTIVE_STATUSES.includes(a.status)).length,
      confirmedToday: todayList.filter((a) => ["confirmada", "chegou", "em-atendimento", "finalizada"].includes(a.status)).length,
      newPatientsMonth: patients.filter((p) => createdIn(p, format(subDays(now, 29), "yyyy-MM-dd"), today)).length,
      newPatientsPrevMonth: patients.filter((p) => createdIn(p, format(subDays(now, 59), "yyyy-MM-dd"), format(subDays(now, 30), "yyyy-MM-dd"))).length,
      openLeads: leads.filter((l) => l.stage !== "fechado" && l.stage !== "perdido").length,
      revenueMonth: paidIn(monthStart, today),
      revenuePrevMonth: paidIn(prevStart, prevSameDay),
      receivable,
      overdue,
      delinquencyRate: dueSoFar ? overdue / dueSoFar : 0,
      activeTreatments: activePlans.length,
    },
    revenueSeries: monthlySeries(receivables, expenses, 6),
    newPatientsSeries,
    leadSources: sourcePerformance(leads),
    funnel,
    appointmentsByWeekday: byWeekday,
    pendingPayments: open.sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 6),
    recentLeads: [...leads].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
    birthdays,
    activePlans,
  };
}
