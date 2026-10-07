"use client";

import { Bell, CalendarPlus, CheckCheck, Clock, CreditCard, RotateCcw, UserPlus, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Popover } from "@/components/ui/popover";
import { useNotifications } from "@/features/notifications/hooks";
import { notificationService } from "@/features/notifications/service";
import type { NotificationType } from "@/features/notifications/types";
import { cn } from "@/utils/cn";
import { formatRelative } from "@/utils/format";

const ICONS: Record<NotificationType, ReactNode> = {
  "nova-consulta": <CalendarPlus />,
  "pagamento-vencendo": <CreditCard />,
  "novo-lead": <UserPlus />,
  "consulta-cancelada": <XCircle />,
  "paciente-aguardando": <Clock />,
  "retorno-pendente": <RotateCcw />,
};

export function NotificationsMenu() {
  const { data = [] } = useNotifications();
  const router = useRouter();
  const unread = data.filter((n) => !n.read).length;

  return (
    <Popover
      align="end"
      className="w-[min(380px,calc(100vw-24px))] p-0"
      trigger={({ open, toggle, ref }) => (
        <button
          ref={ref}
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-label={`Notificações${unread ? `, ${unread} não lidas` : ""}`}
          className={cn("relative flex size-9 items-center justify-center rounded-[10px] text-muted transition-colors hover:bg-sand hover:text-ink", open && "bg-sand text-ink")}
        >
          <Bell className="size-[18px]" />
          {unread ? (
            <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-gold text-[9.5px] font-bold text-white ring-2 ring-ivory">
              {unread}
            </span>
          ) : null}
        </button>
      )}
    >
      {(close) => (
        <div>
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Notificações</p>
              <p className="text-[12px] text-subtle">{unread ? `${unread} não lidas` : "Tudo em dia"}</p>
            </div>
            {unread ? (
              <button
                type="button"
                onClick={() => void notificationService.markAllRead()}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium text-gold-dark hover:bg-gold-soft"
              >
                <CheckCheck className="size-3.5" /> Marcar todas
              </button>
            ) : null}
          </div>
          <ul className="scrollbar-thin max-h-[380px] overflow-y-auto p-1.5">
            {data.length === 0 ? <li className="px-3 py-10 text-center text-[13px] text-subtle">Nenhuma notificação.</li> : null}
            {data.slice(0, 20).map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => {
                    void notificationService.markRead(n.id);
                    close();
                    router.push(n.href);
                  }}
                  className="flex w-full items-start gap-3 rounded-[10px] px-2.5 py-2.5 text-left transition-colors hover:bg-ivory"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full [&_svg]:size-3.5",
                      n.read ? "bg-sand text-subtle" : "bg-gold-soft text-gold-dark",
                    )}
                  >
                    {ICONS[n.type]}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className={cn("truncate text-[13px]", n.read ? "font-medium text-ink-2" : "font-semibold text-ink")}>{n.title}</span>
                      {!n.read ? <span className="size-1.5 shrink-0 rounded-full bg-gold" aria-label="não lida" /> : null}
                    </span>
                    <span className="mt-0.5 block text-[12.5px] leading-snug text-muted">{n.description}</span>
                    <span className="mt-1 block text-[11px] text-subtle">{formatRelative(n.createdAt)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Popover>
  );
}
