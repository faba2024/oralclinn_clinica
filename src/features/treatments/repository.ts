import { CollectionRepository } from "@/repositories/core/collection-repository";
import type { Repository } from "@/repositories/core/repository";
import { seedTreatments } from "@/data/seed";
import type { Treatment } from "./types";

export interface TreatmentRepository extends Repository<Treatment> {
  getBySlug(slug: string): Promise<Treatment | null>;
}

export class DefaultTreatmentRepository extends CollectionRepository<Treatment> implements TreatmentRepository {
  constructor() {
    super("treatments", seedTreatments, "trt");
  }

  async getBySlug(slug: string): Promise<Treatment | null> {
    return (await this.list()).find((t) => t.slug === slug) ?? null;
  }
}
