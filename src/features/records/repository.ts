import { CollectionRepository } from "@/repositories/core/collection-repository";
import type { Repository } from "@/repositories/core/repository";
import { seedRecords } from "@/data/seed";
import type { ClinicalRecord } from "./types";

export interface ClinicalRecordRepository extends Repository<ClinicalRecord> {
  getByPatient(patientId: string): Promise<ClinicalRecord | null>;
}

export class DefaultClinicalRecordRepository
  extends CollectionRepository<ClinicalRecord>
  implements ClinicalRecordRepository
{
  constructor() {
    super("clinical-records", seedRecords, "rcd");
  }

  async getByPatient(patientId: string): Promise<ClinicalRecord | null> {
    return (await this.list()).find((r) => r.patientId === patientId) ?? null;
  }
}
