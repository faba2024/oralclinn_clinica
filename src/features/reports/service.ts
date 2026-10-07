import { differenceInCalendarDays, eachDayOfInterval, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { repositories } from "@/repositories";
import { APPOINTMENT_STATUS } from "@/features/appointments/types";
import { sourcePerformance, type SourcePerformance } from "@/features/crm/service";
import { flattenInstallments } from "@/features/finance/service";
import { professionalService, type ProfessionalPerformance } from "@/features/professionals/service";
import type { DateRange } from "@/types/common";
import { LEAD_SOURCE_LABELS } from "@/types/labels";

export interface ReportData {
  revenue: { total: number; expenses: number; series: { label: string; receita: number }[]; ticket: number };
  appointments: {
    total: number;
    done: number;
    cancelled: number;
    noShow: number;
    online: number;
    byStatus: { name: string; value: number }[];
  };
  patients: { total: number; new: number; byOrigin: { name: string; value: number }[] };
  conversion: { leads: number; won: number; lost: number; rate: number; wonValue: number };
  topTreatments: { name: string; count: number; value: number }[];
  sources: SourcePerformance[];
  professionals: ProfessionalPerformance[];
}

export async function getReport(range: DateRange): Promise<ReportData> {
  const [appointments, receivables, expenses, patients, leads, treatments, professionals] = await Promise.all([
    repositories.appointments.listByRange(range.from, range.to),
    repositories.receivables.list(),
    repositories.expenses.list(),
    repositories.patients.list(),
    repositories.leads.list(),
    repositories.treatments.list(),
    professionalService.performance(range),
  ]);
  const inRange = (d: string | null | undefined) => !!d && d.slice(0, 10) >= range.from && d.slice(0, 10) <= range.to;

  const paid = flattenInstallments(receivables).filter((r) => inRange(r.paidAt));
  const total = paid.reduce((s, r) => s + r.amount, 0);
  const days = Math.max(1, differenceInCalendarDays(parseISO(range.to), parseISO(range.from)) + 1);

  let series: { label: string; receita: number }[];
  if (days <= 31) {
    series = eachDayOfInterval({ start: parseISO(range.from), end: parseISO(range.to) }).map((d) => {
      const iso = format(d, "yyyy-MM-dd");
      return { label: format(d, "dd/MM"), receita: paid.filter((r) => r.paidAt === iso).reduce((s, r) => s + r.amount, 0) };
    });
  } else {
    const map = new Map<string, number>();
    paid.forEach((r) => {
      const key = r.paidAt!.slice(0, 7);
      map.set(key, (map.get(key) ?? 0) + r.amount);
    });
    series = [...map.entries()].sort().map(([k, v]) => ({ label: format(parseISO(`${k}-01`), "MMM/yy", { locale: ptBR }), receita: v }));
  }

  const byStatusMap = new Map<string, number>();
  appointments.forEach((a) => byStatusMap.set(APPOINTMENT_STATUS[a.status].label, (byStatusMap.get(APPOINTMENT_STATUS[a.status].label) ?? 0) + 1));

  const newPatients = patients.filter((p) => inRange(p.createdAt));
  const originMap = new Map<string, number>();
  newPatients.forEach((p) => originMap.set(LEAD_SOURCE_LABELS[p.origin], (originMap.get(LEAD_SOURCE_LABELS[p.origin]) ?? 0) + 1));

  const periodLeads = leads.filter((l) => inRange(l.createdAt));
  const won = periodLeads.filter((l) => l.stage === "fechado");
  const lost = periodLeads.filter((l) => l.stage === "perdido");

  const treatmentMap = new Map<string, { name: string; count: number; value: number }>();
  receivables
    .filter((r) => inRange(r.createdAt) && r.treatmentId)
    .forEach((r) => {
      const name = treatments.find((t) => t.id === r.treatmentId)?.name ?? "Outros";
      const row = treatmentMap.get(name) ?? { name, count: 0, value: 0 };
      row.count += 1;
      row.value += r.installments.reduce((s, i) => s + i.amount, 0);
      treatmentMap.set(name, row);
    });

  const done = appointments.filter((a) => a.status === "finalizada").length;
  return {
    revenue: {
      total,
      expenses: expenses.filter((e) => inRange(e.date)).reduce((s, e) => s + e.amount, 0),
      series,
      ticket: done ? total / done : 0,
    },
    appointments: {
      total: appointments.length,
      done,
      cancelled: appointments.filter((a) => a.status === "cancelada").length,
      noShow: appointments.filter((a) => a.status === "faltou").length,
      online: appointments.filter((a) => a.source === "online").length,
      byStatus: [...byStatusMap.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
    },
    patients: {
      total: patients.length,
      new: newPatients.length,
      byOrigin: [...originMap.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
    },
    conversion: {
      leads: periodLeads.length,
      won: won.length,
      lost: lost.length,
      rate: periodLeads.length ? won.length / periodLeads.length : 0,
      wonValue: won.reduce((s, l) => s + l.potentialValue, 0),
    },
    topTreatments: [...treatmentMap.values()].sort((a, b) => b.value - a.value).slice(0, 8),
    sources: sourcePerformance(leads.filter((l) => inRange(l.createdAt))),
    professionals,
  };
}
