import type { Lead, LeadEvent, LeadStage } from "@/features/crm/types";
import type { LeadSource } from "@/types/common";
import { isoOffset } from "./helpers";

let seq = 0;
const ev = (type: LeadEvent["type"], description: string, offset: number, time: string, author = "Renata Sales"): LeadEvent => ({
  id: `lev_${++seq}`,
  type,
  description,
  at: isoOffset(offset, time),
  author,
});

interface Spec {
  id: string;
  name: string;
  phone: string;
  email: string;
  interest: string;
  treatmentId: string | null;
  source: LeadSource;
  stage: LeadStage;
  value: number;
  owner: string;
  created: number;
  timeline: LeadEvent[];
  notes?: string;
  lostReason?: string;
  patientId?: string;
}

const specs: Spec[] = [
  {
    id: "lead_isabela", name: "Isabela Fontes", phone: "77998120011", email: "isabela.fontes@email.com",
    interest: "Lentes de contato dental", treatmentId: "trt_lentes", source: "instagram", stage: "novo", value: 17600,
    owner: "usr_admin", created: 0,
    timeline: [ev("mensagem", "Chegou pelo direct após o post de antes e depois. Quer saber valores de lentes.", 0, "09:12")],
  },
  {
    id: "lead_marcos", name: "Marcos Vinícius Reis", phone: "77998120012", email: "",
    interest: "Implante unitário", treatmentId: "trt_implante", source: "google", stage: "novo", value: 4200,
    owner: "usr_admin", created: -1,
    timeline: [ev("contato", "Formulário do site preenchido via anúncio do Google.", -1, "18:40", "Sistema")],
  },
  {
    id: "lead_sofia", name: "Sofia Andrade", phone: "77998120013", email: "sofia.andrade@email.com",
    interest: "Clareamento", treatmentId: "trt_clareamento", source: "site", stage: "contato", value: 1200,
    owner: "usr_admin", created: -3,
    timeline: [
      ev("contato", "Solicitou orçamento pelo site.", -3, "10:05", "Sistema"),
      ev("mensagem", "Enviadas informações sobre o protocolo combinado. Aguardando retorno.", -2, "11:20", "Ana Paula Reis"),
    ],
  },
  {
    id: "lead_roberto", name: "Roberto Campos", phone: "77998120014", email: "roberto.campos@email.com",
    interest: "Protocolo superior", treatmentId: "trt_implante", source: "indicacao", stage: "avaliacao-agendada", value: 32000,
    owner: "usr_admin", created: -6, notes: "Indicado pelo paciente João Henrique.",
    timeline: [
      ev("ligacao", "Ligação de 12 min. Usa prótese removível há 8 anos, quer solução fixa.", -6, "15:00"),
      ev("avaliacao", "Avaliação agendada com Dr. Lucas Ferreira.", -5, "09:30"),
    ],
  },
  {
    id: "lead_tatiane", name: "Tatiane Lopes", phone: "77998120015", email: "tatiane.lopes@email.com",
    interest: "Alinhadores invisíveis", treatmentId: "trt_alinhadores", source: "instagram", stage: "compareceu", value: 9800,
    owner: "usr_admin", created: -12,
    timeline: [
      ev("mensagem", "Direct no Instagram perguntando sobre alinhadores.", -12, "20:10"),
      ev("avaliacao", "Compareceu à avaliação. Escaneamento realizado.", -7, "10:00", "Dra. Beatriz Lemos"),
    ],
  },
  {
    id: "lead_diego", name: "Diego Santana", phone: "77998120016", email: "diego.santana@email.com",
    interest: "Facetas em resina", treatmentId: "trt_facetas", source: "campanha", stage: "proposta", value: 7200,
    owner: "usr_admin", created: -15,
    timeline: [
      ev("contato", "Lead da campanha 'Sorriso de Primavera'.", -15, "12:00", "Sistema"),
      ev("avaliacao", "Avaliação realizada. Indicadas 8 facetas superiores.", -10, "16:00", "Dra. Camila Andrade"),
      ev("mensagem", "Proposta enviada pelo WhatsApp com opção em 10x.", -9, "09:40"),
    ],
  },
  {
    id: "lead_aline", name: "Aline Barreto", phone: "77998120017", email: "aline.barreto@email.com",
    interest: "Lentes de contato dental", treatmentId: "trt_lentes", source: "instagram", stage: "negociacao", value: 22000,
    owner: "usr_admin", created: -20,
    timeline: [
      ev("avaliacao", "Avaliação e planejamento digital apresentados.", -14, "14:00", "Dra. Camila Andrade"),
      ev("ligacao", "Pediu condição para pagamento em 12x. Em análise com a gestão.", -4, "17:15"),
    ],
  },
  {
    id: "lead_vanessa", name: "Vanessa Pires", phone: "77998120018", email: "vanessa.pires@email.com",
    interest: "Implante + prótese", treatmentId: "trt_implante", source: "indicacao", stage: "fechado", value: 8600,
    owner: "usr_admin", created: -34,
    timeline: [
      ev("avaliacao", "Avaliação com tomografia.", -28, "09:00", "Dr. Lucas Ferreira"),
      ev("etapa", "Proposta aprovada. Entrada via PIX.", -21, "11:00"),
    ],
  },
  {
    id: "lead_eduardo", name: "Eduardo Prates", phone: "77998120019", email: "",
    interest: "Clareamento", treatmentId: "trt_clareamento", source: "facebook", stage: "fechado", value: 1200,
    owner: "usr_admin", created: -40,
    timeline: [ev("etapa", "Fechou clareamento combinado.", -36, "15:30", "Ana Paula Reis")],
  },
  {
    id: "lead_monica", name: "Mônica Freitas", phone: "77998120020", email: "monica.freitas@email.com",
    interest: "Alinhadores invisíveis", treatmentId: "trt_alinhadores", source: "google", stage: "perdido", value: 9200,
    owner: "usr_admin", created: -45, lostReason: "Optou por adiar o tratamento por motivos financeiros.",
    timeline: [
      ev("avaliacao", "Avaliação realizada.", -40, "10:00", "Dra. Beatriz Lemos"),
      ev("observacao", "Paciente pediu para retomar contato em 3 meses.", -33, "16:00"),
    ],
  },
  {
    id: "lead_rodrigo", name: "Rodrigo Azevedo", phone: "77998120021", email: "rodrigo.azevedo@email.com",
    interest: "Facetas", treatmentId: "trt_facetas", source: "whatsapp", stage: "contato", value: 5400,
    owner: "usr_admin", created: -5,
    timeline: [ev("mensagem", "Chamou no WhatsApp da clínica pedindo horários para avaliação.", -5, "08:50")],
  },
  {
    id: "lead_leticia", name: "Letícia Amaral", phone: "77998120022", email: "leticia.amaral@email.com",
    interest: "Harmonização orofacial", treatmentId: "trt_harmonizacao", source: "instagram", stage: "fechado", value: 2800,
    owner: "usr_admin", created: -62,
    timeline: [ev("etapa", "Procedimento realizado e pago.", -50, "14:00")],
  },
];

export function seedLeads(): Lead[] {
  seq = 0;
  return specs.map((s) => ({
    id: s.id,
    name: s.name,
    phone: s.phone,
    email: s.email,
    interest: s.interest,
    treatmentId: s.treatmentId,
    source: s.source,
    stage: s.stage,
    potentialValue: s.value,
    ownerId: s.owner,
    lastContactAt: s.timeline.length ? s.timeline[s.timeline.length - 1].at : null,
    notes: s.notes ?? "",
    lostReason: s.lostReason,
    patientId: s.patientId ?? null,
    timeline: s.timeline,
    createdAt: isoOffset(s.created, "09:00"),
    updatedAt: isoOffset(s.created, "09:00"),
  }));
}
