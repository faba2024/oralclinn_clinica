import { CollectionRepository } from "@/repositories/core/collection-repository";
import type { Repository } from "@/repositories/core/repository";
import { seedProfessionals } from "@/data/seed";
import type { Professional } from "./types";

export type ProfessionalRepository = Repository<Professional>;

export class DefaultProfessionalRepository extends CollectionRepository<Professional> implements ProfessionalRepository {
  constructor() {
    super("professionals", seedProfessionals, "prof");
  }
}
