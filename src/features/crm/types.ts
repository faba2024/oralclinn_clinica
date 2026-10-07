import type { Entity, LeadSource } from "@/types/common";

export type LeadStage =
  | "novo"
  | "contato"
  | "avaliacao-agendada"
  | "compareceu"
  | "proposta"
  | "negociacao"
  | "fechado"
  | "perdido";

export const LEAD_STAGES: { id: LeadStage; label: string }[] = [
  { id: "novo", label: "Novo lead" },
  { id: "contato", label: "Contato feito" },
  { id: "avaliacao-agendada", label: "Avaliação agendada" },
  { id: "compareceu", label: "Compareceu" },
  { id: "proposta", label: "Proposta enviada" },
  { id: "negociacao", label: "Negociação" },
  { id: "fechado", label: "Fechado" },
  { id: "perdido", label: "Perdido" },
];

export const LEAD_STAGE_LABELS = Object.fromEntries(LEAD_STAGES.map((s) => [s.id, s.label])) as Record<
  LeadStage,
  string
>;

export type LeadEventType = "contato" | "mensagem" | "ligacao" | "avaliacao" | "observacao" | "etapa";

export const LEAD_EVENT_LABELS: Record<LeadEventType, string> = {
  contato: "Contato",
  mensagem: "Mensagem",
  ligacao: "Ligação",
  avaliacao: "Avaliação",
  observacao: "Observação",
  etapa: "Mudança de etapa",
};

export interface LeadEvent {
  id: string;
  type: LeadEventType;
  description: string;
  at: string;
  author: string;
}

export interface Lead extends Entity {
  name: string;
  phone: string;
  email: string;
  interest: string;
  treatmentId: string | null;
  source: LeadSource;
  stage: LeadStage;
  potentialValue: number;
  ownerId: string;
  lastContactAt: string | null;
  notes: string;
  lostReason?: string;
  patientId?: string | null;
  timeline: LeadEvent[];
}
