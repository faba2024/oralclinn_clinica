import type { PaymentMethod } from "@/types/common";

export interface WhatsappTemplate {
  id: string;
  key: "confirmacao" | "lembrete" | "retorno" | "orcamento" | "pos-atendimento" | "personalizado";
  name: string;
  body: string;
}

export interface ClinicSettings {
  clinic: {
    name: string;
    legalName: string;
    cnpj: string;
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    instagram: string;
    technicalResponsible: string;
  };
  agenda: {
    openTime: string;
    closeTime: string;
    slotMinutes: number;
    workingDays: number[];
    rooms: string[];
    allowOnlineBooking: boolean;
    onlineBookingLeadHours: number;
  };
  finance: {
    acceptedMethods: PaymentMethod[];
    maxInstallments: number;
    proposalValidityDays: number;
    defaultPaymentTerms: string;
    defaultCommission: number;
  };
  notifications: {
    newAppointment: boolean;
    paymentDue: boolean;
    newLead: boolean;
    cancellation: boolean;
    patientWaiting: boolean;
    pendingReturn: boolean;
  };
  whatsapp: {
    senderNumber: string;
    signature: string;
    templates: WhatsappTemplate[];
  };
  appearance: {
    density: "confortavel" | "compacta";
    sidebarCollapsed: boolean;
  };
}
