import type { Entity } from "@/types/common";

export type TreatmentCategory =
  | "estetica"
  | "implantes"
  | "ortodontia"
  | "reabilitacao"
  | "prevencao"
  | "endodontia"
  | "periodontia"
  | "harmonizacao"
  | "fonoaudiologia"
  | "ginecologia";

export const TREATMENT_CATEGORY_LABELS: Record<TreatmentCategory, string> = {
  estetica: "Estética do sorriso",
  implantes: "Implantes",
  ortodontia: "Ortodontia",
  reabilitacao: "Reabilitação oral",
  prevencao: "Prevenção",
  endodontia: "Endodontia",
  periodontia: "Periodontia",
  harmonizacao: "Harmonização orofacial",
  fonoaudiologia: "Fonoaudiologia",
  ginecologia: "Ginecologia",
};

export interface Treatment extends Entity {
  slug: string;
  name: string;
  category: TreatmentCategory;
  shortDescription: string;
  description: string;
  benefits: string[];
  image?: string;
  priceFrom: number;
  durationMinutes: number;
  sessions: string;
  professionalIds: string[];
  active: boolean;
  featured: boolean;
  order: number;
}
