import type { Entity } from "@/types/common";

export type ToothState =
  | "saudavel"
  | "carie"
  | "restauracao"
  | "ausente"
  | "implante"
  | "coroa"
  | "planejado"
  | "concluido";

export const TOOTH_STATES: Record<ToothState, { label: string; fill: string; stroke: string }> = {
  saudavel: { label: "Saudável", fill: "#ffffff", stroke: "#cfc7b6" },
  carie: { label: "Cárie", fill: "#f1d9d5", stroke: "#a8483e" },
  restauracao: { label: "Restauração", fill: "#dfe7ee", stroke: "#4f6a80" },
  ausente: { label: "Ausente", fill: "#efefed", stroke: "#b9b6b0" },
  implante: { label: "Implante", fill: "#e6dfd1", stroke: "#6d5b3b" },
  coroa: { label: "Coroa", fill: "#f3e7cc", stroke: "#b69a67" },
  planejado: { label: "Tratamento planejado", fill: "#f7eedc", stroke: "#a8792f" },
  concluido: { label: "Tratamento concluído", fill: "#e2ede4", stroke: "#4f7a5a" },
};

export interface ToothRecord {
  state: ToothState;
  note?: string;
}

export interface Evolution {
  id: string;
  date: string;
  professionalId: string;
  procedure: string;
  teeth: string;
  description: string;
}

export interface ClinicalRecord extends Entity {
  patientId: string;
  chiefComplaint: string;
  medicalHistory: string;
  allergies: string;
  medications: string;
  conditions: string;
  clinicalNotes: string;
  therapeuticPlan: string;
  odontogram: Record<string, ToothRecord>;
  evolutions: Evolution[];
}

/** Numeração FDI — arcada superior (direita→esquerda do paciente) e inferior. */
export const UPPER_TEETH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
export const LOWER_TEETH = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
