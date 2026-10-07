import type { Entity } from "@/types/common";

export type DocumentCategory = "fotos" | "radiografias" | "exames" | "documentos" | "termos" | "contratos";

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  fotos: "Fotos",
  radiografias: "Radiografias",
  exames: "Exames",
  documentos: "Documentos",
  termos: "Termos",
  contratos: "Contratos",
};

export const DOCUMENT_CATEGORIES = Object.keys(DOCUMENT_CATEGORY_LABELS) as DocumentCategory[];

export interface PatientDocument extends Entity {
  patientId: string;
  category: DocumentCategory;
  name: string;
  mimeType: string;
  size: number;
  /** Referência devolvida pelo FileStorage (data URL local hoje; URL assinada amanhã). */
  url: string;
  description: string;
  uploadedBy: string;
}
