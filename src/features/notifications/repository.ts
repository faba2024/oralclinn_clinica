import { CollectionRepository } from "@/repositories/core/collection-repository";
import type { Repository } from "@/repositories/core/repository";
import { seedNotifications } from "@/data/seed";
import type { AppNotification } from "./types";

export interface NotificationRepository extends Repository<AppNotification> {
  markAllRead(): Promise<void>;
}

export class DefaultNotificationRepository
  extends CollectionRepository<AppNotification>
  implements NotificationRepository
{
  constructor() {
    super("notifications", seedNotifications, "ntf");
  }

  async markAllRead(): Promise<void> {
    const unread = (await this.list()).filter((n) => !n.read);
    await Promise.all(unread.map((n) => this.update(n.id, { read: true })));
  }
}
