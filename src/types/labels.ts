import type { LeadSource, PaymentMethod } from "./common";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pix: "PIX",
  dinheiro: "Dinheiro",
  debito: "Débito",
  credito: "Crédito",
  transferencia: "Transferência",
  boleto: "Boleto",
};

export const PAYMENT_METHODS = Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[];

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  instagram: "Instagram",
  google: "Google",
  facebook: "Facebook",
  whatsapp: "WhatsApp",
  site: "Site",
  indicacao: "Indicação",
  campanha: "Campanha",
  outro: "Outro",
};

export const LEAD_SOURCES = Object.keys(LEAD_SOURCE_LABELS) as LeadSource[];
