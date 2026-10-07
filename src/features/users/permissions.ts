import type { ModuleKey, UserRole } from "./types";

/** Matriz de permissões por perfil. Validada no servidor (APIs) e usada no painel para montar o menu. */
export const ROLE_PERMISSIONS: Record<UserRole, ModuleKey[]> = {
  admin: [
    "dashboard", "agenda", "agendamentos", "pacientes", "crm", "tratamentos", "orcamentos", "financeiro", "profissionais", "horarios",
    "prontuarios", "antes-depois", "relatorios", "conteudo", "whatsapp", "configuracoes",
  ],
  recepcao: ["dashboard", "agenda", "agendamentos", "pacientes", "whatsapp", "orcamentos"],
  dentista: ["dashboard", "agenda", "agendamentos", "pacientes", "prontuarios", "orcamentos", "antes-depois"],
  financeiro: ["dashboard", "financeiro", "orcamentos", "relatorios", "pacientes"],
  comercial: ["dashboard", "agendamentos", "crm", "whatsapp", "orcamentos", "relatorios"],
};

export function canAccess(role: UserRole | undefined, moduleKey: ModuleKey): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role].includes(moduleKey);
}

export const MODULE_LABELS: Record<ModuleKey, string> = {
  dashboard: "Visão geral",
  agenda: "Agenda",
  agendamentos: "Agendamentos",
  pacientes: "Pacientes",
  crm: "CRM",
  tratamentos: "Tratamentos",
  orcamentos: "Orçamentos",
  financeiro: "Financeiro",
  profissionais: "Profissionais",
  horarios: "Horários",
  prontuarios: "Prontuários",
  "antes-depois": "Antes e Depois",
  relatorios: "Relatórios",
  conteudo: "Conteúdo",
  whatsapp: "WhatsApp",
  configuracoes: "Configurações",
};

export function moduleFromPath(pathname: string): ModuleKey {
  const segment = pathname.replace(/^\/admin\/?/, "").split("/")[0];
  if (!segment) return "dashboard";
  return (segment in MODULE_LABELS ? segment : "dashboard") as ModuleKey;
}
