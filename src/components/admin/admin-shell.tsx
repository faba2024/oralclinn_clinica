"use client";

import { Lock } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Logo } from "@/components/shared/brand";
import { buttonVariants } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { canAccess, MODULE_LABELS, moduleFromPath } from "@/features/users/permissions";
import type { SessionUser } from "@/features/users/types";
import { useLiveRefresh } from "@/hooks/use-live-refresh";
import { SessionProvider } from "@/stores/auth-store";
import { useUiStore } from "@/stores/ui-store";
import { CommandPalette } from "./command-palette";
import { KeyboardShortcuts } from "./shortcuts";
import { Sidebar, SidebarNav } from "./sidebar";
import { Topbar } from "./topbar";

function AccessDenied({ moduleName }: { moduleName: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-24 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full border border-line bg-white text-gold-dark">
        <Lock className="size-5" />
      </div>
      <h1 className="text-lg font-semibold">Acesso restrito</h1>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">
        Seu perfil não tem permissão para acessar <strong className="text-ink">{moduleName}</strong>. Solicite acesso ao administrador da clínica.
      </p>
      <Link href="/admin" className={buttonVariants({ variant: "secondary", className: "mt-6" })}>
        Voltar para a visão geral
      </Link>
    </div>
  );
}

/**
 * Estrutura do painel. A sessão já foi validada no servidor (middleware +
 * layout); aqui apenas espelhamos o usuário para o menu e as permissões.
 */
export function AdminShell({ initialUser, children }: { initialUser: SessionUser; children: ReactNode }) {
  const user = initialUser;
  const pathname = usePathname();
  const { mobileNavOpen, setMobileNavOpen } = useUiStore();

  useLiveRefresh();
  useEffect(() => setMobileNavOpen(false), [pathname, setMobileNavOpen]);

  const currentModule = moduleFromPath(pathname);
  const allowed = canAccess(user.role, currentModule);

  return (
    <SessionProvider user={user}>
    <div className="flex min-h-dvh bg-ivory">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-ink focus:px-3 focus:py-2 focus:text-white">
        Pular para o conteúdo
      </a>
      <Sidebar />
      <Drawer open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} side="left" width="max-w-[280px]" hideHeader label="Menu">
        <div className="flex h-16 items-center border-b border-line px-5">
          <Logo />
        </div>
        <div className="px-4 py-4">
          <SidebarNav onNavigate={() => setMobileNavOpen(false)} />
        </div>
      </Drawer>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main id="conteudo" className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {allowed ? children : <AccessDenied moduleName={MODULE_LABELS[currentModule]} />}
        </main>
      </div>
      <CommandPalette />
      <KeyboardShortcuts />
    </div>
    </SessionProvider>
  );
}
