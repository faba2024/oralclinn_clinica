import type { Entity } from "@/types/common";

export interface BeforeAfterCase extends Entity {
  title: string;
  patientId: string | null;
  patientLabel: string; // exibido no site — anônimo por padrão
  treatmentId: string;
  professionalId: string;
  beforeImage: string;
  afterImage: string;
  date: string;
  description: string;
  published: boolean;
  consentConfirmed: boolean;
}
