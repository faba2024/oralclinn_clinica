"use client";

import { ArrowRight, CalendarDays, CornerDownLeft, Search, Sparkles, SquareKanban, Stethoscope, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Portal, useOverlay } from "@/components/ui/portal";
import { Kbd } from "@/components/ui/kbd";
import { useAppointments } from "@/features/appointments/hooks";
import { APPOINTMENT_STATUS } from "@/features/appointments/types";
import { useLeads } from "@/features/crm/hooks";
import { LEAD_STAGE_LABELS } from "@/features/crm/types";
import { professionalDisplayName } from "@/features/professionals/types";
import { canAccess } from "@/features/users/permissions";
import { useHotkey } from "@/hooks/use-hotkey";
import { useLookups } from "@/hooks/use-lookups";
import { useAuthStore } from "@/stores/auth-store";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/utils/cn";
import { todayISO } from "@/utils/dates";
import { formatDate, formatPhone, matchesSearch } from "@/utils/format";
import { NAV_ITEMS } from "./nav-config";

interface Result {
  id: string;
  group: string;
  title: string;
  subtitle?: string;
  icon: ReactNode;
  href: string;
}

export function CommandPalette() {
  const open = useUiStore((s) => s.commandOpen);
  const setOpen = useUiStore((s) => s.setCommandOpen);
  useHotkey("k", () => setOpen(!useUiStore.getState().commandOpen));
  return open ? <PaletteDialog onClose={() => setOpen(false)} /> : null;
}

function PaletteDialog({ onClose }: { onClose: () => void }) {
  const ref = useOverlay(true, onClose);
  const router = useRouter();
  const role = useAuthStore((s) => s.user?.role);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);
  const lookups = useLookups();
  const { data: leads = [] } = useLeads();
  const { data: appointments = [] } = useAppointments();

  const results = useMemo<Result[]>(() => {
    const q = query.trim();
    const out: Result[] = [];
    const pages = NAV_ITEMS.filter((n) => canAccess(role, n.module) && matchesSearch(q, n.label)).map((n) => ({
      id: `nav-${n.href}`,
      group: "Ir para",
      title: n.label,
      icon: n.icon,
      href: n.href,
    }));

    if (canAccess(role, "pacientes")) {
      lookups.patients
        .filter((p) => q && matchesSearch(q, p.name, p.phone, p.cpf, p.email))
        .slice(0, 6)
        .forEach((p) =>
          out.push({ id: p.id, group: "Pacientes", title: p.name, subtitle: formatPhone(p.phone), icon: <Users />, href: `/admin/pacientes/${p.id}` }),
        );
    }
    if (canAccess(role, "crm")) {
      leads
        .filter((l) => q && matchesSearch(q, l.name, l.phone, l.interest))
        .slice(0, 5)
        .forEach((l) =>
          out.push({ id: l.id, group: "Leads", title: l.name, subtitle: `${l.interest} · ${LEAD_STAGE_LABELS[l.stage]}`, icon: <SquareKanban />, href: `/admin/crm?lead=${l.id}` }),
        );
    }
    if (canAccess(role, "agenda")) {
      const today = todayISO();
      appointments
        .filter((a) => a.date >= today && q && matchesSearch(q, a.patientName, lookups.treatmentName(a.treatmentId)))
        .sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`))
        .slice(0, 5)
        .forEach((a) =>
          out.push({
            id: a.id,
            group: "Consultas",
            title: `${a.patientName} — ${lookups.treatmentName(a.treatmentId)}`,
            subtitle: `${formatDate(a.date, "dd/MM")} às ${a.start} · ${APPOINTMENT_STATUS[a.status].label}`,
            icon: <CalendarDays />,
            href: `/admin/agenda?data=${a.date}&consulta=${a.id}`,
          }),
        );
    }
    if (canAccess(role, "tratamentos")) {
      lookups.treatments
        .filter((t) => q && matchesSearch(q, t.name))
        .slice(0, 4)
        .forEach((t) => out.push({ id: t.id, group: "Tratamentos", title: t.name, subtitle: t.shortDescription, icon: <Sparkles />, href: `/admin/tratamentos?editar=${t.id}` }));
    }
    if (canAccess(role, "profissionais")) {
      lookups.professionals
        .filter((p) => q && matchesSearch(q, p.name, p.specialty))
        .slice(0, 3)
        .forEach((p) => out.push({ id: p.id, group: "Profissionais", title: professionalDisplayName(p), subtitle: p.specialty, icon: <Stethoscope />, href: `/admin/profissionais?id=${p.id}` }));
    }
    return q ? [...out, ...pages] : pages;
  }, [query, role, lookups, leads, appointments]);

  useEffect(() => setIndex(0), [query]);
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${index}"]`)?.scrollIntoView({ block: "nearest" });
  }, [index]);

  const go = (r: Result | undefined) => {
    if (!r) return;
    onClose();
    router.push(r.href);
  };

  const grouped = results.reduce<Record<string, { item: Result; i: number }[]>>((acc, item, i) => {
    (acc[item.group] ??= []).push({ item, i });
    return acc;
  }, {});

  return (
    <Portal>
      <div className="fixed inset-0 z-[80] flex items-start justify-center px-3 pt-[12vh]">
        <div className="absolute inset-0 animate-fade-in bg-ink/30 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label="Busca global"
          className="relative w-full max-w-xl animate-scale-in overflow-hidden rounded-[16px] border border-line bg-white shadow-[var(--shadow-pop)]"
        >
          <div className="flex items-center gap-3 border-b border-line px-4">
            <Search className="size-4 text-subtle" aria-hidden />
            <input
              data-autofocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setIndex((i) => Math.min(results.length - 1, i + 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setIndex((i) => Math.max(0, i - 1));
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  go(results[index]);
                }
              }}
              placeholder="Buscar paciente, lead, consulta, tratamento ou profissional"
              className="h-14 flex-1 bg-transparent text-[15px] text-ink placeholder:text-subtle focus:outline-none"
              role="combobox"
              aria-expanded
              aria-controls="command-results"
              aria-activedescendant={results[index] ? `cmd-${results[index].id}` : undefined}
            />
            <Kbd>Esc</Kbd>
          </div>
          <ul id="command-results" ref={listRef} role="listbox" className="scrollbar-thin max-h-[52vh] overflow-y-auto p-2">
            {results.length === 0 ? (
              <li className="px-3 py-10 text-center text-[13px] text-subtle">Nenhum resultado para “{query}”.</li>
            ) : null}
            {Object.entries(grouped).map(([group, items]) => (
              <li key={group} role="presentation">
                <p className="px-2.5 pb-1 pt-2.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-subtle">{group}</p>
                <ul role="presentation">
                  {items.map(({ item, i }) => (
                    <li
                      key={item.id}
                      id={`cmd-${item.id}`}
                      role="option"
                      aria-selected={i === index}
                      data-index={i}
                      onMouseMove={() => setIndex(i)}
                      onClick={() => go(item)}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-[10px] px-2.5 py-2 transition-colors",
                        i === index ? "bg-sand" : "",
                      )}
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-line bg-white text-gold-dark [&_svg]:size-4">
                        {item.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-medium text-ink">{item.title}</span>
                        {item.subtitle ? <span className="block truncate text-[12px] text-subtle">{item.subtitle}</span> : null}
                      </span>
                      {i === index ? <CornerDownLeft className="size-3.5 text-subtle" /> : <ArrowRight className="size-3.5 text-transparent" />}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-4 border-t border-line bg-ivory px-4 py-2.5 text-[11.5px] text-subtle">
            <span className="flex items-center gap-1"><Kbd>↑</Kbd><Kbd>↓</Kbd> navegar</span>
            <span className="flex items-center gap-1"><Kbd>Enter</Kbd> abrir</span>
          </div>
        </div>
      </div>
    </Portal>
  );
}
