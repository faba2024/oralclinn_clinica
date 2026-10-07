import type { Entity, Tone } from "@/types/common";

export type AppointmentStatus =
  | "agendada"
  | "confirmada"
  | "aguardando"
  | "chegou"
  | "em-atendimento"
  | "finalizada"
  | "cancelada"
  | "faltou";

export const APPOINTMENT_STATUS: Record<AppointmentStatus, { label: string; tone: Tone }> = {
  agendada: { label: "Agendada", tone: "neutral" },
  confirmada: { label: "Confirmada", tone: "success" },
  aguardando: { label: "Aguardando", tone: "warning" },
  chegou: { label: "Paciente chegou", tone: "gold" },
  "em-atendimento": { label: "Em atendimento", tone: "info" },
  finalizada: { label: "Finalizada", tone: "success" },
  cancelada: { label: "Cancelada", tone: "danger" },
  faltou: { label: "Faltou", tone: "danger" },
};

export const APPOINTMENT_STATUSES = Object.keys(APPOINTMENT_STATUS) as AppointmentStatus[];

export type AppointmentPaymentStatus = "pendente" | "pago" | "parcial" | "cortesia";

export const APPOINTMENT_PAYMENT_LABELS: Record<AppointmentPaymentStatus, string> = {
  pendente: "Pendente",
  pago: "Pago",
  parcial: "Parcial",
  cortesia: "Cortesia",
};

export interface Appointment extends Entity {
  patientId: string | null;
  patientName: string;
  patientPhone: string;
  professionalId: string;
  treatmentId: string;
  room: string;
  date: string; // yyyy-MM-dd
  start: string; // HH:mm
  duration: number; // minutos
  status: AppointmentStatus;
  price: number;
  paymentStatus: AppointmentPaymentStatus;
  notes: string;
  source: "painel" | "online" | "whatsapp";
}

export type AppointmentView = "hoje" | "dia" | "semana" | "mes";

export interface AppointmentFilters {
  professionalId: string;
  treatmentId: string;
  status: AppointmentStatus | "";
  room: string;
}
