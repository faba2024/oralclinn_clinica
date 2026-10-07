import { repositories } from "@/repositories";
import type { ClinicSettings } from "@/features/settings/types";
import type { AppNotification, NotificationType } from "./types";

const toggleBySettings: Record<NotificationType, keyof ClinicSettings["notifications"]> = {
  "nova-consulta": "newAppointment",
  "pagamento-vencendo": "paymentDue",
  "novo-lead": "newLead",
  "consulta-cancelada": "cancellation",
  "paciente-aguardando": "patientWaiting",
  "retorno-pendente": "pendingReturn",
};

export const notificationService = {
  async list(): Promise<AppNotification[]> {
    const items = await repositories.notifications.list();
    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async push(type: NotificationType, title: string, description: string, href: string): Promise<void> {
    const settings = await repositories.settings.get();
    if (!settings.notifications[toggleBySettings[type]]) return;
    await repositories.notifications.create({ type, title, description, href, read: false });
  },

  markRead: (id: string) => repositories.notifications.update(id, { read: true }),
  markAllRead: () => repositories.notifications.markAllRead(),
  remove: (id: string) => repositories.notifications.remove(id),
};
