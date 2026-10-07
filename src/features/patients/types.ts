import type { Entity, LeadSource } from "@/types/common";

export type PatientStatus = "novo" | "ativo" | "em-tratamento" | "inativo";

export const PATIENT_STATUS_LABELS: Record<PatientStatus, string> = {
  novo: "Novo",
  ativo: "Ativo",
  "em-tratamento": "Em tratamento",
  inativo: "Inativo",
};

export interface Patient extends Entity {
  name: string;
  phone: string;
  email: string;
  cpf: string;
  birthDate: string;
  gender: "feminino" | "masculino" | "outro" | "";
  address: string;
  occupation: string;
  responsibleProfessionalId: string;
  status: PatientStatus;
  origin: LeadSource;
  photo?: string;
  importantNotes: string;
  tags: string[];
}

/** Visão consolidada calculada pelo service a partir de agenda, planos e financeiro. */
export interface PatientOverview {
  patient: Patient;
  lastAppointment: { date: string; start: string } | null;
  nextAppointment: { date: string; start: string; id: string } | null;
  currentTreatment: string | null;
  totalSpent: number;
  pendingBalance: number;
  activePlans: number;
}
