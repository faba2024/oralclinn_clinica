import type { Entity, Tone } from "@/types/common";

export type PlanStatus = "rascunho" | "enviado" | "aprovado" | "em-andamento" | "concluido" | "recusado";

export const PLAN_STATUS: Record<PlanStatus, { label: string; tone: Tone }> = {
  rascunho: { label: "Rascunho", tone: "neutral" },
  enviado: { label: "Enviado", tone: "info" },
  aprovado: { label: "Aprovado", tone: "success" },
  "em-andamento": { label: "Em andamento", tone: "gold" },
  concluido: { label: "Concluído", tone: "success" },
  recusado: { label: "Recusado", tone: "danger" },
};

export const PLAN_STATUSES = Object.keys(PLAN_STATUS) as PlanStatus[];

export interface PlanItem {
  id: string;
  treatmentId: string | null;
  procedure: string;
  region: string;
  quantity: number;
  unitPrice: number;
  discount: number; // valor em R$
}

export interface TreatmentPlan extends Entity {
  code: string;
  patientId: string;
  professionalId: string;
  title: string;
  items: PlanItem[];
  globalDiscount: number; // valor em R$
  status: PlanStatus;
  paymentTerms: string;
  validUntil: string;
  notes: string;
}

export interface PlanTotals {
  subtotal: number;
  itemDiscounts: number;
  globalDiscount: number;
  discount: number;
  total: number;
}
