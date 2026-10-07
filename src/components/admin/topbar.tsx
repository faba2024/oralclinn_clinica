"use client";

import { ExternalLink, KeyRound, Keyboard, LogOut, Menu, Search, Settings } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Kbd } from "@/components/ui/kbd";
import { Popover } from "@/components/ui/popover";
import { ChangePasswordDialog } from "@/features/users/components/change-password-dialog";
import { signOutAndRedirect } from "@/features/users/session";
import { USER_ROLE_LABELS } from "@/features/users/types";
import { useAuthStore } from "@/stores/auth-store";
import { useUiStore } from "@/stores/ui-store";
import { NotificationsMenu } from "./notifications-menu";

export function Topbar() {
  const user = useAuthStore((s) => s.user);
  const { setCommandOpen, setMobileNavOpen, setShortcutsOpen } = useUiStore();
  const [passwordOpen, setPasswordOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b border-line bg-ivory/85 px-4 backdrop-blur-md sm:gap-3 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={() => setMobileNavOpen(true)}
        className="flex size-9 items-center justify-center rounded-[10px] text-ink-2 hover:bg-sand md:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="size-5" />
      </button>

      <button
        type="button"
        onClick={() => setCommandOpen(true)}
        className="group flex h-9 min-w-0 flex-1 items-center gap-2.5 rounded-[10px] border border-line bg-white px-3 text-left text-[13px] text-subtle shadow-[0_1px_2px_rgba(32,32,32,0.03)] transition-colors hover:border-line-strong sm:max-w-md"
        aria-label="Buscar pacientes, leads, consultas (Ctrl+K)"
      >
        <Search className="size-4 shrink-0" />
        <span className="truncate">Buscar paciente, lead, consulta…</span>
        <span className="ml-auto hidden items-center gap-1 sm:flex">
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
        </span>
      </button>

      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          onClick={() => setShortcutsOpen(true)}
          className="hidden size-9 items-center justify-center rounded-[10px] text-muted transition-colors hover:bg-sand hover:text-ink sm:flex"
          aria-label="Atalhos de teclado"
        >
          <Keyboard className="size-[18px]" />
        </button>
        <NotificationsMenu />
        <div className="mx-1 hidden h-6 w-px bg-line sm:block" />
        <Popover
          align="end"
          className="w-60"
          trigger={({ open, toggle, ref }) => (
            <button
              ref={ref}
              type="button"
              onClick={toggle}
              aria-expanded={open}
              aria-label="Menu do perfil"
              className="flex items-center gap-2.5 rounded-[10px] p-1 pr-1.5 transition-colors hover:bg-sand sm:pr-2.5"
            >
              <Avatar name={user?.name ?? "Usuário"} size="sm" />
              <span className="hidden text-left leading-tight lg:block">
                <span className="block max-w-36 truncate text-[13px] font-semibold text-ink">{user?.name}</span>
                <span className="block text-[11.5px] text-subtle">{user ? USER_ROLE_LABELS[user.role] : ""}</span>
              </span>
            </button>
          )}
        >
          {(close) => (
            <div>
              <div className="px-2.5 py-2">
                <p className="truncate text-[13px] font-semibold">{user?.name}</p>
                <p className="truncate text-[12px] text-subtle">{user?.email}</p>
              </div>
              <div className="my-1 h-px bg-line" />
              {user?.role === "admin" ? (
                <Link
                  href="/admin/configuracoes"
                  onClick={close}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-ink-2 hover:bg-sand"
                >
                  <Settings className="size-4 text-subtle" /> Configurações
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  close();
                  setPasswordOpen(true);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-ink-2 hover:bg-sand"
              >
                <KeyRound className="size-4 text-subtle" /> Alterar minha senha
              </button>
              <Link href="/" target="_blank" onClick={close} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-ink-2 hover:bg-sand">
                <ExternalLink className="size-4 text-subtle" /> Ver site da clínica
              </Link>
              <div className="my-1 h-px bg-line" />
              <button
                type="button"
                onClick={async () => {
                  close();
                  await signOutAndRedirect();
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-danger hover:bg-danger-soft"
              >
                <LogOut className="size-4" /> Sair
              </button>
            </div>
          )}
        </Popover>
      </div>
      <ChangePasswordDialog open={passwordOpen} onClose={() => setPasswordOpen(false)} />
    </header>
  );
}
