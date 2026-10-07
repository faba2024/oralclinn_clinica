"use client";

import { ChevronsLeft, ChevronsRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo, LogoMark } from "@/components/shared/brand";
import { Tooltip } from "@/components/ui/tooltip";
import { canAccess } from "@/features/users/permissions";
import { useAuthStore } from "@/stores/auth-store";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/utils/cn";
import { NAV_GROUP_LABELS, NAV_ITEMS, type NavItem } from "./nav-config";

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const role = useAuthStore((s) => s.user?.role);
  const items = NAV_ITEMS.filter((i) => canAccess(role, i.module));
  const groups = (Object.keys(NAV_GROUP_LABELS) as NavItem["group"][])
    .map((g) => ({ id: g, items: items.filter((i) => i.group === g) }))
    .filter((g) => g.items.length);

  return (
    <nav aria-label="Menu principal" className="flex flex-col gap-5">
      {groups.map((group) => (
        <div key={group.id}>
          {!collapsed ? (
            <p className="mb-1.5 px-3 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-subtle/80">{NAV_GROUP_LABELS[group.id]}</p>
          ) : (
            <div className="mx-auto mb-2 h-px w-6 bg-line" />
          )}
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              const link = (
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex h-9 items-center gap-3 rounded-[9px] text-[13.5px] font-medium transition-colors duration-150 [&_svg]:size-[17px] [&_svg]:shrink-0",
                    collapsed ? "w-9 justify-center" : "px-3",
                    active ? "bg-white text-ink shadow-[0_1px_2px_rgba(32,32,32,0.06),0_0_0_1px_var(--color-line)]" : "text-muted hover:bg-white/60 hover:text-ink",
                  )}
                >
                  <span className={cn("transition-colors", active ? "text-gold-dark" : "text-subtle group-hover:text-ink-2")}>{item.icon}</span>
                  {!collapsed ? <span className="truncate">{item.label}</span> : <span className="sr-only">{item.label}</span>}
                  {active && !collapsed ? <span className="absolute -left-3 top-2 h-5 w-[3px] rounded-r-full bg-gold" aria-hidden /> : null}
                </Link>
              );
              return (
                <li key={item.href} className={collapsed ? "flex justify-center" : undefined}>
                  {collapsed ? (
                    <Tooltip content={item.label} side="right">
                      {link}
                    </Tooltip>
                  ) : (
                    link
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggle = useUiStore((s) => s.toggleSidebar);

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-line bg-sand/60 transition-[width] duration-200 md:flex",
        collapsed ? "w-[68px]" : "w-[68px] lg:w-[248px]",
      )}
    >
      <div className={cn("flex h-16 items-center", collapsed ? "justify-center" : "justify-center px-5 lg:justify-start")}>
        <Link href="/admin" aria-label="Oralclin — visão geral">
          <span className={collapsed ? "" : "lg:hidden"}>
            <LogoMark />
          </span>
          {!collapsed ? (
            <span className="hidden lg:block">
              <Logo />
            </span>
          ) : null}
        </Link>
      </div>
      <div className={cn("scrollbar-thin flex-1 overflow-y-auto py-3", collapsed ? "px-3" : "px-3 lg:px-4")}>
        <div className={collapsed ? "" : "lg:hidden"}>
          <SidebarNav collapsed />
        </div>
        {!collapsed ? (
          <div className="hidden lg:block">
            <SidebarNav />
          </div>
        ) : null}
      </div>
      <div className={cn("border-t border-line p-3", !collapsed && "lg:px-4")}>
        {!collapsed ? (
          <div className="mb-3 hidden rounded-[10px] border border-line bg-white/70 p-3 lg:block">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-dark">Site conectado</p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-muted">Agendamentos e contatos do site chegam aqui automaticamente.</p>
            <Link href="/" target="_blank" className="mt-2 inline-flex items-center gap-1 text-[11.5px] font-medium text-ink hover:text-gold-dark">
              Ver site <ExternalLink className="size-3" />
            </Link>
          </div>
        ) : null}
        <button
          type="button"
          onClick={toggle}
          className="hidden h-8 w-full items-center justify-center gap-2 rounded-lg text-[12px] text-subtle transition-colors hover:bg-white hover:text-ink lg:flex"
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          {collapsed ? <ChevronsRight className="size-4" /> : <><ChevronsLeft className="size-4" /> Recolher</>}
        </button>
      </div>
    </aside>
  );
}
