import type { Entity } from "@/types/common";

export interface WorkingHours {
  weekday: number; // 0 = domingo
  start: string;
  end: string;
}

export interface Professional extends Entity {
  title: "Dr." | "Dra." | "Fga." | "Fgo.";
  name: string;
  cro: string;
  specialty: string;
  phone: string;
  email: string;
  bio: string;
  photo?: string;
  color: string;
  workingHours: WorkingHours[];
  treatmentIds: string[];
  status: "ativo" | "inativo";
  commissionRate: number; // 0–1
  showOnSite: boolean;
}

export function professionalDisplayName(p: Pick<Professional, "title" | "name">): string {
  return `${p.title} ${p.name}`;
}

export const WEEKDAY_LABELS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
export const WEEKDAY_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
