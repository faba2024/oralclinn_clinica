import type { Entity } from "@/types/common";

export type UserRole = "admin" | "recepcao" | "dentista" | "financeiro" | "comercial";

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  recepcao: "Recepção",
  dentista: "Dentista",
  financeiro: "Financeiro",
  comercial: "Comercial",
};

export const USER_ROLES = Object.keys(USER_ROLE_LABELS) as UserRole[];

export interface User extends Entity {
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  professionalId: string | null;
  lastLoginAt: string | null;
}

export type SessionUser = Pick<User, "id" | "name" | "email" | "role" | "professionalId">;

export type ModuleKey =
  | "dashboard"
  | "agenda"
  | "agendamentos"
  | "pacientes"
  | "crm"
  | "tratamentos"
  | "orcamentos"
  | "financeiro"
  | "profissionais"
  | "horarios"
  | "prontuarios"
  | "antes-depois"
  | "relatorios"
  | "conteudo"
  | "whatsapp"
  | "configuracoes";
