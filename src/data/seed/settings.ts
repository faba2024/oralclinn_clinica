import type { ClinicSettings } from "@/features/settings/types";

export function seedSettings(): ClinicSettings {
  return {
    clinic: {
      name: "Oralclin",
      legalName: "",
      cnpj: "",
      phone: "77981636419",
      whatsapp: "77981636419",
      email: "",
      address: "Rua José Joaquim de Souza, Centro — Rio do Pires - BA",
      instagram: "oralclinrp",
      technicalResponsible: "",
    },
    agenda: {
      openTime: "08:00",
      closeTime: "19:00",
      slotMinutes: 30,
      workingDays: [1, 2, 3, 4, 5, 6],
      rooms: ["Consultório 1", "Consultório 2", "Consultório 3", "Sala de imagem"],
      allowOnlineBooking: true,
      onlineBookingLeadHours: 2,
    },
    finance: {
      acceptedMethods: ["pix", "dinheiro", "debito", "credito", "transferencia", "boleto"],
      maxInstallments: 12,
      proposalValidityDays: 15,
      defaultPaymentTerms: "Entrada + parcelas no cartão de crédito ou 5% de desconto à vista no PIX.",
      defaultCommission: 0.35,
    },
    notifications: {
      newAppointment: true,
      paymentDue: true,
      newLead: true,
      cancellation: true,
      patientWaiting: true,
      pendingReturn: true,
    },
    whatsapp: {
      senderNumber: "77981636419",
      signature: "Equipe Oralclin",
      templates: [
        { id: "tpl_confirmacao", key: "confirmacao", name: "Confirmação", body: "Olá, {nome}! Sua consulta na Oralclin está confirmada para {data} às {hora}." },
        { id: "tpl_lembrete", key: "lembrete", name: "Lembrete", body: "Olá, {nome}! Passando para lembrar da sua consulta amanhã às {hora}." },
        { id: "tpl_retorno", key: "retorno", name: "Retorno", body: "Olá, {nome}. Está na hora de agendar seu retorno." },
        { id: "tpl_orcamento", key: "orcamento", name: "Orçamento", body: "Olá, {nome}! Seu orçamento está pronto. Posso te enviar os detalhes por aqui?" },
        { id: "tpl_pos", key: "pos-atendimento", name: "Pós-atendimento", body: "Olá, {nome}! Como você está se sentindo após o atendimento de hoje? Qualquer dúvida, estamos à disposição." },
      ],
    },
    appearance: {
      density: "confortavel",
      sidebarCollapsed: false,
    },
  };
}
