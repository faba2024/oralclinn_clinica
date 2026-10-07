import { CollectionRepository } from "@/repositories/core/collection-repository";
import type { Repository } from "@/repositories/core/repository";
import type { PatientDocument } from "./types";

export interface DocumentRepository extends Repository<PatientDocument> {
  listByPatient(patientId: string): Promise<PatientDocument[]>;
}

export class DefaultDocumentRepository extends CollectionRepository<PatientDocument> implements DocumentRepository {
  constructor() {
    super("documents", () => [], "doc");
  }

  async listByPatient(patientId: string): Promise<PatientDocument[]> {
    return (await this.list()).filter((d) => d.patientId === patientId);
  }
}
