import { CollectionRepository } from "@/repositories/core/collection-repository";
import type { Repository } from "@/repositories/core/repository";
import { seedLeads } from "@/data/seed";
import type { Lead } from "./types";

export type LeadRepository = Repository<Lead>;

export class DefaultLeadRepository extends CollectionRepository<Lead> implements LeadRepository {
  constructor() {
    super("leads", seedLeads, "lead");
  }
}
