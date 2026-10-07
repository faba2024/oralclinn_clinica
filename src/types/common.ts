/** Base de toda entidade persistida — o mesmo formato vale para a futura API. */
export interface Entity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateInput<T extends Entity> = Omit<T, "id" | "createdAt" | "updatedAt"> & { id?: string };
export type UpdateInput<T extends Entity> = Partial<Omit<T, "id" | "createdAt">>;

export type PaymentMethod = "pix" | "dinheiro" | "debito" | "credito" | "transferencia" | "boleto";

export type LeadSource =
  | "instagram"
  | "google"
  | "facebook"
  | "whatsapp"
  | "site"
  | "indicacao"
  | "campanha"
  | "outro";

export type PeriodPreset = "hoje" | "7d" | "30d" | "este-mes" | "ultimo-mes" | "personalizado";

export interface DateRange {
  from: string; // yyyy-MM-dd
  to: string; // yyyy-MM-dd
}

export type Tone = "neutral" | "gold" | "success" | "warning" | "danger" | "info";
