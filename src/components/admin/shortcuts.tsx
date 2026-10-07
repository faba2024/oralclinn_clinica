"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { useUiStore } from "@/stores/ui-store";

const SEQUENCES: Record<string, { href: string; label: string }> = {
  d: { href: "/admin", label: "Visão geral" },
  a: { href: "/admin/agenda", label: "Agenda" },
  p: { href: "/admin/pacientes", label: "Pacientes" },
  c: { href: "/admin/crm", label: "CRM" },
  o: { href: "/admin/orcamentos", label: "Orçamentos" },
  f: { href: "/admin/financeiro", label: "Financeiro" },
  r: { href: "/admin/relatorios", label: "Relatórios" },
};

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
}

/** Atalhos "G + letra" para navegação rápida e "?" para a lista de atalhos. */
export function KeyboardShortcuts() {
  const router = useRouter();
  const { shortcutsOpen, setShortcutsOpen } = useUiStore();

  useEffect(() => {
    let awaiting = false;
    let timer: number | undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      if (e.key === "?") {
        setShortcutsOpen(true);
        return;
      }
      if (awaiting) {
        awaiting = false;
        const target = SEQUENCES[e.key.toLowerCase()];
        if (target) router.push(target.href);
        return;
      }
      if (e.key.toLowerCase() === "g") {
        awaiting = true;
        window.clearTimeout(timer);
        timer = window.setTimeout(() => (awaiting = false), 1200);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(timer);
    };
  }, [router, setShortcutsOpen]);

  return (
    <Dialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} title="Atalhos de teclado" size="sm">
      <dl className="space-y-2.5 text-[13px]">
        <div className="flex items-center justify-between">
          <dt className="text-muted">Busca global</dt>
          <dd className="flex gap-1"><Kbd>Ctrl</Kbd><Kbd>K</Kbd></dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted">Lista de atalhos</dt>
          <dd><Kbd>?</Kbd></dd>
        </div>
        <div className="h-px bg-line" />
        {Object.entries(SEQUENCES).map(([key, s]) => (
          <div key={key} className="flex items-center justify-between">
            <dt className="text-muted">{s.label}</dt>
            <dd className="flex gap-1"><Kbd>G</Kbd><Kbd>{key.toUpperCase()}</Kbd></dd>
          </div>
        ))}
      </dl>
    </Dialog>
  );
}
