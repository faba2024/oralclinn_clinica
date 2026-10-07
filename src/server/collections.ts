import "./bootstrap";
import { repositories } from "@/repositories";
import type { CollectionRepository, SingletonDocRepository } from "@/repositories/core/collection-repository";
import type { ModuleKey, UserRole } from "@/features/users/types";
import { ROLE_PERMISSIONS } from "@/features/users/permissions";
import type { Entity } from "@/types/common";

type AnyCollection = CollectionRepository<Entity>;

/** Coleções expostas pela API administrativa → repositório e módulos com permissão de escrita. */
export const COLLECTIONS: Record<string, { repo: AnyCollection; write: ModuleKey[] }> = {
  patients: { repo: repositories.patients as unknown as AnyCollection, write: ["pacientes", "agenda", "agendamentos", "crm", "orcamentos"] },
  professionals: { repo: repositories.professionals as unknown as AnyCollection, write: ["profissionais", "horarios"] },
  treatments: { repo: repositories.treatments as unknown as AnyCollection, write: ["tratamentos"] },
  appointments: { repo: repositories.appointments as unknown as AnyCollection, write: ["agenda", "agendamentos", "pacientes"] },
  leads: { repo: repositories.leads as unknown as AnyCollection, write: ["crm", "agendamentos"] },
  "clinical-records": { repo: repositories.records as unknown as AnyCollection, write: ["prontuarios"] },
  "treatment-plans": { repo: repositories.plans as unknown as AnyCollection, write: ["orcamentos"] },
  receivables: { repo: repositories.receivables as unknown as AnyCollection, write: ["financeiro", "orcamentos"] },
  expenses: { repo: repositories.expenses as unknown as AnyCollection, write: ["financeiro"] },
  "before-after": { repo: repositories.beforeAfter as unknown as AnyCollection, write: ["antes-depois"] },
  documents: { repo: repositories.documents as unknown as AnyCollection, write: ["pacientes", "prontuarios"] },
  notifications: { repo: repositories.notifications as unknown as AnyCollection, write: ["dashboard"] },
};

export const DOCS: Record<string, { repo: SingletonDocRepository<object>; write: ModuleKey[] }> = {
  "site-content": { repo: repositories.siteContent as unknown as SingletonDocRepository<object>, write: ["conteudo"] },
  settings: { repo: repositories.settings as unknown as SingletonDocRepository<object>, write: ["configuracoes", "whatsapp", "horarios"] },
};

export function canWrite(role: UserRole, modules: ModuleKey[]): boolean {
  return modules.some((m) => ROLE_PERMISSIONS[role].includes(m));
}
