import type { AppNotification } from "@/features/notifications/types";
import { isoOffset } from "./helpers";

export function seedNotifications(): AppNotification[] {
  const n = (id: string, type: AppNotification["type"], title: string, description: string, href: string, offset: number, time: string, read = false): AppNotification => ({
    id, type, title, description, href, read, createdAt: isoOffset(offset, time), updatedAt: isoOffset(offset, time),
  });
  return [
    n("ntf_1", "paciente-aguardando", "Paciente na recepção", "Larissa Moura chegou para o horário das 10:00.", "/admin/agenda", 0, "09:52"),
    n("ntf_2", "novo-lead", "Novo lead do Instagram", "Isabela Fontes tem interesse em lentes de contato.", "/admin/crm", 0, "09:12"),
    n("ntf_3", "nova-consulta", "Agendamento online", "Bruno Carvalho agendou uma avaliação para hoje às 16:30.", "/admin/agenda", -1, "21:03"),
    n("ntf_4", "pagamento-vencendo", "Parcela vence em 2 dias", "Gustavo Teixeira — clareamento caseiro supervisionado.", "/admin/financeiro", -1, "08:00"),
    n("ntf_5", "retorno-pendente", "Retorno semestral", "Patrícia Gomes está há mais de 6 meses sem consulta.", "/admin/pacientes/pac_patricia", -2, "08:00", true),
    n("ntf_6", "consulta-cancelada", "Consulta cancelada", "Um horário de quinta-feira foi liberado na agenda da Dra. Beatriz.", "/admin/agenda", -3, "17:20", true),
  ];
}
