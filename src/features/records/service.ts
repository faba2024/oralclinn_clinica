import { repositories } from "@/repositories";
import { createId } from "@/utils/id";
import type { ClinicalRecord, Evolution, ToothRecord } from "./types";

type Anamnesis = Pick<
  ClinicalRecord,
  "chiefComplaint" | "medicalHistory" | "allergies" | "medications" | "conditions" | "clinicalNotes" | "therapeuticPlan"
>;

function emptyRecord(patientId: string): Omit<ClinicalRecord, "id" | "createdAt" | "updatedAt"> {
  return {
    patientId,
    chiefComplaint: "",
    medicalHistory: "",
    allergies: "",
    medications: "",
    conditions: "",
    clinicalNotes: "",
    therapeuticPlan: "",
    odontogram: {},
    evolutions: [],
  };
}

async function ensure(patientId: string): Promise<ClinicalRecord> {
  const existing = await repositories.records.getByPatient(patientId);
  return existing ?? repositories.records.create(emptyRecord(patientId));
}

/**
 * Prontuário clínico. Registra apenas o que o profissional informa —
 * não há diagnóstico automático nem sugestão de tratamento.
 */
export const recordService = {
  list: () => repositories.records.list(),
  getByPatient: (patientId: string) => repositories.records.getByPatient(patientId),
  ensure,

  async saveAnamnesis(patientId: string, data: Anamnesis) {
    const record = await ensure(patientId);
    return repositories.records.update(record.id, data);
  },

  async addEvolution(patientId: string, evolution: Omit<Evolution, "id">) {
    const record = await ensure(patientId);
    const evolutions = [...record.evolutions, { ...evolution, id: createId("evo") }];
    return repositories.records.update(record.id, { evolutions });
  },

  async updateEvolution(patientId: string, evolution: Evolution) {
    const record = await ensure(patientId);
    return repositories.records.update(record.id, {
      evolutions: record.evolutions.map((e) => (e.id === evolution.id ? evolution : e)),
    });
  },

  async removeEvolution(patientId: string, evolutionId: string) {
    const record = await ensure(patientId);
    return repositories.records.update(record.id, { evolutions: record.evolutions.filter((e) => e.id !== evolutionId) });
  },

  async setTooth(patientId: string, tooth: string, value: ToothRecord | null) {
    const record = await ensure(patientId);
    const odontogram = { ...record.odontogram };
    if (!value || (value.state === "saudavel" && !value.note)) delete odontogram[tooth];
    else odontogram[tooth] = value;
    return repositories.records.update(record.id, { odontogram });
  },
};
