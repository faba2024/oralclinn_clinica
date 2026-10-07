import { repositories } from "@/repositories";
import { flattenInstallments } from "@/features/finance/service";
import type { CreateInput, DateRange } from "@/types/common";
import type { Professional } from "./types";

export interface ProfessionalPerformance {
  professional: Professional;
  procedures: number;
  production: number;
  commission: number;
  patients: number;
  noShows: number;
}

export const professionalService = {
  list: async () => (await repositories.professionals.list()).sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
  get: (id: string) => repositories.professionals.getById(id),
  create: (input: CreateInput<Professional>) => repositories.professionals.create(input),
  update: (id: string, patch: Partial<Professional>) => repositories.professionals.update(id, patch),
  remove: (id: string) => repositories.professionals.remove(id),

  /** Produção = parcelas recebidas no período atribuídas ao profissional. */
  async performance(range: DateRange): Promise<ProfessionalPerformance[]> {
    const [professionals, appointments, receivables] = await Promise.all([
      repositories.professionals.list(),
      repositories.appointments.listByRange(range.from, range.to),
      repositories.receivables.list(),
    ]);
    const rows = flattenInstallments(receivables);
    return professionals.map((professional) => {
      const done = appointments.filter((a) => a.professionalId === professional.id && a.status === "finalizada");
      const production = rows
        .filter((r) => r.professionalId === professional.id && r.paidAt && r.paidAt >= range.from && r.paidAt <= range.to)
        .reduce((s, r) => s + r.amount, 0);
      return {
        professional,
        procedures: done.length,
        production,
        commission: production * professional.commissionRate,
        patients: new Set(done.map((a) => a.patientId)).size,
        noShows: appointments.filter((a) => a.professionalId === professional.id && a.status === "faltou").length,
      };
    });
  },
};
