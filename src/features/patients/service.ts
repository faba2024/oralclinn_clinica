import { repositories } from "@/repositories";
import { INACTIVE_STATUSES } from "@/features/appointments/service";
import { flattenInstallments } from "@/features/finance/service";
import type { CreateInput } from "@/types/common";
import { todayISO } from "@/utils/dates";
import type { Patient, PatientOverview } from "./types";

async function buildOverviews(patients: Patient[]): Promise<PatientOverview[]> {
  const [appointments, receivables, plans, treatments] = await Promise.all([
    repositories.appointments.list(),
    repositories.receivables.list(),
    repositories.plans.list(),
    repositories.treatments.list(),
  ]);
  const today = todayISO();
  const nowTime = new Date().toTimeString().slice(0, 5);
  const installments = flattenInstallments(receivables);
  const treatmentName = (id: string | null) => treatments.find((t) => t.id === id)?.name ?? null;

  return patients.map((patient) => {
    const own = appointments
      .filter((a) => a.patientId === patient.id && !INACTIVE_STATUSES.includes(a.status))
      .sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`));
    const isPast = (a: (typeof own)[number]) => a.date < today || (a.date === today && a.start < nowTime) || a.status === "finalizada";
    const past = own.filter(isPast);
    const future = own.filter((a) => !isPast(a));
    const last = past[past.length - 1] ?? null;
    const next = future[0] ?? null;
    const ownInst = installments.filter((i) => i.patientId === patient.id);
    const activePlans = plans.filter((p) => p.patientId === patient.id && (p.status === "aprovado" || p.status === "em-andamento"));
    const currentTreatment =
      activePlans[0]?.title ?? treatmentName(next?.treatmentId ?? null) ?? treatmentName(last?.treatmentId ?? null);
    return {
      patient,
      lastAppointment: last ? { date: last.date, start: last.start } : null,
      nextAppointment: next ? { date: next.date, start: next.start, id: next.id } : null,
      currentTreatment,
      totalSpent: ownInst.filter((i) => i.paidAt).reduce((s, i) => s + i.amount, 0),
      pendingBalance: ownInst.filter((i) => !i.paidAt).reduce((s, i) => s + i.amount, 0),
      activePlans: activePlans.length,
    };
  });
}

export const patientService = {
  list: async () => (await repositories.patients.list()).sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
  get: (id: string) => repositories.patients.getById(id),
  search: (term: string) => repositories.patients.search(term),
  create: (input: CreateInput<Patient>) => repositories.patients.create(input),
  update: (id: string, patch: Partial<Patient>) => repositories.patients.update(id, patch),
  remove: (id: string) => repositories.patients.remove(id),

  async listOverviews(): Promise<PatientOverview[]> {
    return buildOverviews(await patientService.list());
  },

  async getOverview(id: string): Promise<PatientOverview | null> {
    const patient = await repositories.patients.getById(id);
    if (!patient) return null;
    const [overview] = await buildOverviews([patient]);
    return overview;
  },
};
