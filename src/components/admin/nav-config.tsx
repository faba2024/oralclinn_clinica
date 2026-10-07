import {
  BarChart3,
  CalendarCheck2,
  CalendarDays,
  Clock,
  ClipboardList,
  FileText,
  Images,
  LayoutDashboard,
  MessageCircle,
  Newspaper,
  Settings,
  Sparkles,
  SquareKanban,
  Stethoscope,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import type { ReactNode } from "react";
import type { ModuleKey } from "@/features/users/types";

export interface NavItem {
  module: ModuleKey;
  label: string;
  href: string;
  icon: ReactNode;
  group: "operacao" | "clinico" | "gestao" | "sistema";
}

export const NAV_ITEMS: NavItem[] = [
  { module: "dashboard", label: "Visão geral", href: "/admin", icon: <LayoutDashboard />, group: "operacao" },
  { module: "agenda", label: "Agenda", href: "/admin/agenda", icon: <CalendarDays />, group: "operacao" },
  { module: "agendamentos", label: "Agendamentos", href: "/admin/agendamentos", icon: <CalendarCheck2 />, group: "operacao" },
  { module: "pacientes", label: "Pacientes", href: "/admin/pacientes", icon: <Users />, group: "operacao" },
  { module: "crm", label: "CRM", href: "/admin/crm", icon: <SquareKanban />, group: "operacao" },
  { module: "tratamentos", label: "Tratamentos", href: "/admin/tratamentos", icon: <Sparkles />, group: "clinico" },
  { module: "orcamentos", label: "Orçamentos", href: "/admin/orcamentos", icon: <FileText />, group: "clinico" },
  { module: "prontuarios", label: "Prontuários", href: "/admin/prontuarios", icon: <ClipboardList />, group: "clinico" },
  { module: "antes-depois", label: "Antes e Depois", href: "/admin/antes-depois", icon: <Images />, group: "clinico" },
  { module: "financeiro", label: "Financeiro", href: "/admin/financeiro", icon: <Wallet />, group: "gestao" },
  { module: "profissionais", label: "Profissionais", href: "/admin/profissionais", icon: <Stethoscope />, group: "gestao" },
  { module: "horarios", label: "Horários", href: "/admin/horarios", icon: <Clock />, group: "gestao" },
  { module: "relatorios", label: "Relatórios", href: "/admin/relatorios", icon: <BarChart3 />, group: "gestao" },
  { module: "conteudo", label: "Conteúdo", href: "/admin/conteudo", icon: <Newspaper />, group: "sistema" },
  { module: "whatsapp", label: "WhatsApp", href: "/admin/whatsapp", icon: <MessageCircle />, group: "sistema" },
  { module: "configuracoes", label: "Configurações", href: "/admin/configuracoes", icon: <Settings />, group: "sistema" },
];

export const NAV_GROUP_LABELS: Record<NavItem["group"], string> = {
  operacao: "Operação",
  clinico: "Clínico",
  gestao: "Gestão",
  sistema: "Site e sistema",
};

export const PROFILE_ICON = <UserRound />;
