import type { Entity } from "@/types/common";

export type NotificationType =
  | "nova-consulta"
  | "pagamento-vencendo"
  | "novo-lead"
  | "consulta-cancelada"
  | "paciente-aguardando"
  | "retorno-pendente";

export interface AppNotification extends Entity {
  type: NotificationType;
  title: string;
  description: string;
  href: string;
  read: boolean;
}
