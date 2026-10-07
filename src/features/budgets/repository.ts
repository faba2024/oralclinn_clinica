import { CollectionRepository } from "@/repositories/core/collection-repository";
import type { Repository } from "@/repositories/core/repository";
import { seedPlans } from "@/data/seed";
import type { TreatmentPlan } from "./types";

export interface TreatmentPlanRepository extends Repository<TreatmentPlan> {
  listByPatient(patientId: string): Promise<TreatmentPlan[]>;
  nextCode(): Promise<string>;
}

export class DefaultTreatmentPlanRepository
  extends CollectionRepository<TreatmentPlan>
  implements TreatmentPlanRepository
{
  constructor() {
    super("treatment-plans", seedPlans, "plan");
  }

  async listByPatient(patientId: string): Promise<TreatmentPlan[]> {
    return (await this.list()).filter((p) => p.patientId === patientId);
  }

  async nextCode(): Promise<string> {
    const numbers = (await this.list()).map((p) => Number(p.code.replace(/\D/g, "")) || 0);
    const next = Math.max(100, ...numbers) + 1;
    return `ORC-${String(next).padStart(4, "0")}`;
  }
}
