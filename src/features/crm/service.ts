import { repositories } from "@/repositories";
import { notificationService } from "@/features/notifications/service";
import { LEAD_SOURCE_LABELS } from "@/types/labels";
import type { CreateInput, LeadSource } from "@/types/common";
import { createId } from "@/utils/id";
import { LEAD_STAGE_LABELS, type Lead, type LeadEvent, type LeadStage } from "./types";

export const crmService = {
  list: async () => (await repositories.leads.list()).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  get: (id: string) => repositories.leads.getById(id),

  async create(input: Omit<CreateInput<Lead>, "timeline" | "lastContactAt">, author: string): Promise<Lead> {
    const now = new Date().toISOString();
    const lead = await repositories.leads.create({
      ...input,
      lastContactAt: now,
      timeline: [{ id: createId("lev"), type: "contato", description: `Lead cadastrado (${LEAD_SOURCE_LABELS[input.source]}).`, at: now, author }],
    });
    await notificationService.push("novo-lead", "Novo lead", `${lead.name} — ${lead.interest || "interesse a definir"}.`, "/admin/crm");
    return lead;
  },

  update: (id: string, patch: Partial<Lead>) => repositories.leads.update(id, patch),
  remove: (id: string) => repositories.leads.remove(id),

  async moveStage(id: string, stage: LeadStage, author: string): Promise<Lead | null> {
    const lead = await repositories.leads.getById(id);
    if (!lead || lead.stage === stage) return lead;
    const now = new Date().toISOString();
    const event: LeadEvent = {
      id: createId("lev"),
      type: "etapa",
      description: `${LEAD_STAGE_LABELS[lead.stage]} → ${LEAD_STAGE_LABELS[stage]}`,
      at: now,
      author,
    };
    return repositories.leads.update(id, { stage, lastContactAt: now, timeline: [...lead.timeline, event] });
  },

  async addEvent(id: string, event: Omit<LeadEvent, "id" | "at">): Promise<Lead | null> {
    const lead = await repositories.leads.getById(id);
    if (!lead) return null;
    const now = new Date().toISOString();
    return repositories.leads.update(id, {
      lastContactAt: now,
      timeline: [...lead.timeline, { ...event, id: createId("lev"), at: now }],
    });
  },

  /** Converte o lead em paciente, reaproveitando o cadastro se o telefone já existir. */
  async convertToPatient(id: string, author: string): Promise<string | null> {
    const lead = await repositories.leads.getById(id);
    if (!lead) return null;
    if (lead.patientId) return lead.patientId;
    const existing = (await repositories.patients.list()).find((p) => p.phone === lead.phone);
    const patient =
      existing ??
      (await repositories.patients.create({
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        cpf: "",
        birthDate: "",
        gender: "",
        address: "",
        occupation: "",
        responsibleProfessionalId: "",
        status: "novo",
        origin: lead.source,
        importantNotes: lead.notes,
        tags: [],
      }));
    await repositories.leads.update(id, { patientId: patient.id });
    await crmService.addEvent(id, { type: "observacao", description: "Lead convertido em paciente.", author });
    return patient.id;
  },
};

export interface SourcePerformance {
  source: LeadSource;
  label: string;
  leads: number;
  won: number;
  conversion: number;
  value: number;
}

export function sourcePerformance(leads: Lead[]): SourcePerformance[] {
  const map = new Map<LeadSource, SourcePerformance>();
  for (const lead of leads) {
    const row = map.get(lead.source) ?? { source: lead.source, label: LEAD_SOURCE_LABELS[lead.source], leads: 0, won: 0, conversion: 0, value: 0 };
    row.leads += 1;
    if (lead.stage === "fechado") {
      row.won += 1;
      row.value += lead.potentialValue;
    }
    map.set(lead.source, row);
  }
  return [...map.values()]
    .map((r) => ({ ...r, conversion: r.leads ? r.won / r.leads : 0 }))
    .sort((a, b) => b.leads - a.leads);
}
