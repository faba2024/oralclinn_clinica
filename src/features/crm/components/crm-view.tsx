"use client";

import { GripVertical, Plus, Search, SquareKanban } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Select } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useLookups } from "@/hooks/use-lookups";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "@/stores/toast-store";
import type { LeadSource } from "@/types/common";
import { LEAD_SOURCE_LABELS, LEAD_SOURCES } from "@/types/labels";
import { cn } from "@/utils/cn";
import { formatCurrency, formatCurrencyCompact, formatPercent, formatPhone, formatRelative, matchesSearch } from "@/utils/format";
import { useLeads } from "../hooks";
import { crmService, sourcePerformance } from "../service";
import { LEAD_STAGES, type Lead, type LeadStage } from "../types";
import { LeadDrawer } from "./lead-drawer";
import { LeadFormDialog } from "./lead-form-dialog";

export function CrmView() {
  const { data, loading } = useLeads();
  const lookups = useLookups();
  const user = useAuthStore((s) => s.user);
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<LeadSource | "">("");
  const [selectedId, setSelectedId] = useState<string | null>(() => params.get("lead"));
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<LeadStage | null>(null);

  useEffect(() => {
    if (params.get("lead")) router.replace(pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const leads = useMemo(
    () => (data ?? []).filter((l) => (!source || l.source === source) && matchesSearch(query, l.name, l.phone, l.interest)),
    [data, source, query],
  );
  const selected = (data ?? []).find((l) => l.id === selectedId) ?? null;

  const metrics = useMemo(() => {
    const all = data ?? [];
    const open = all.filter((l) => l.stage !== "fechado" && l.stage !== "perdido");
    const won = all.filter((l) => l.stage === "fechado");
    const decided = all.filter((l) => l.stage === "fechado" || l.stage === "perdido");
    const best = sourcePerformance(all)
      .filter((s) => s.won > 0)
      .sort((a, b) => b.conversion - a.conversion || b.value - a.value)[0];
    return {
      pipeline: open.reduce((s, l) => s + l.potentialValue, 0),
      openCount: open.length,
      wonValue: won.reduce((s, l) => s + l.potentialValue, 0),
      conversion: decided.length ? won.length / decided.length : 0,
      best,
    };
  }, [data]);

  const move = async (id: string, stage: LeadStage) => {
    const lead = (data ?? []).find((l) => l.id === id);
    if (!lead || lead.stage === stage) return;
    await crmService.moveStage(id, stage, user?.name ?? "Equipe");
    toast.success(`${lead.name.split(" ")[0]} → ${LEAD_STAGES.find((s) => s.id === stage)?.label}`);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="CRM"
        description="Funil comercial do primeiro contato ao fechamento."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus /> Novo lead
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Pipeline em aberto" value={formatCurrency(metrics.pipeline)} hint={`${metrics.openCount} leads ativos`} />
        <StatCard label="Fechado" value={formatCurrency(metrics.wonValue)} hint="valor dos leads ganhos" />
        <StatCard label="Taxa de conversão" value={formatPercent(metrics.conversion)} hint="sobre leads decididos" />
        <StatCard label="Origem mais eficiente" value={metrics.best?.label ?? "—"} hint={metrics.best ? `${formatPercent(metrics.best.conversion)} de conversão` : "sem fechamentos"} />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="sm:w-72">
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar lead" leading={<Search />} aria-label="Buscar lead" />
        </div>
        <div className="sm:w-48">
          <Select value={source} onChange={(e) => setSource(e.target.value as LeadSource | "")} aria-label="Filtrar por origem">
            <option value="">Todas as origens</option>
            {LEAD_SOURCES.map((s) => (
              <option key={s} value={s}>
                {LEAD_SOURCE_LABELS[s]}
              </option>
            ))}
          </Select>
        </div>
        <p className="text-[12px] text-subtle sm:ml-auto sm:self-center">Arraste os cards entre as colunas ou use o menu de cada card.</p>
      </div>

      {loading && !data ? (
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-96 w-72 shrink-0" />
          ))}
        </div>
      ) : (data ?? []).length === 0 ? (
        <EmptyState icon={<SquareKanban />} title="Nenhum lead ainda" description="Cadastre leads manualmente ou receba pelo site e agendamento online." />
      ) : (
        <div className="scrollbar-thin -mx-4 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex gap-3">
            {LEAD_STAGES.map((stage) => {
              const items = leads.filter((l) => l.stage === stage.id);
              const total = items.reduce((s, l) => s + l.potentialValue, 0);
              return (
                <section
                  key={stage.id}
                  aria-label={stage.label}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setOverStage(stage.id);
                  }}
                  onDragLeave={() => setOverStage((s) => (s === stage.id ? null : s))}
                  onDrop={(e) => {
                    e.preventDefault();
                    const id = e.dataTransfer.getData("text/plain");
                    setOverStage(null);
                    setDragId(null);
                    if (id) void move(id, stage.id);
                  }}
                  className={cn(
                    "flex w-[272px] shrink-0 flex-col rounded-[14px] bg-sand/70 p-2 ring-1 ring-line transition-colors",
                    overStage === stage.id && "bg-gold-soft ring-gold",
                  )}
                >
                  <header className="flex items-center justify-between px-2 pb-2 pt-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          stage.id === "fechado" ? "bg-success" : stage.id === "perdido" ? "bg-danger" : stage.id === "novo" ? "bg-gold" : "bg-ink/40",
                        )}
                      />
                      <h2 className="text-[13px] font-semibold">{stage.label}</h2>
                      <span className="rounded-full bg-white px-1.5 text-[11px] font-semibold tabular text-muted">{items.length}</span>
                    </div>
                    <span className="text-[11.5px] font-medium tabular text-subtle">{formatCurrencyCompact(total)}</span>
                  </header>
                  <ul className="flex min-h-24 flex-col gap-2">
                    {items.map((lead) => (
                      <li
                        key={lead.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", lead.id);
                          e.dataTransfer.effectAllowed = "move";
                          setDragId(lead.id);
                        }}
                        onDragEnd={() => setDragId(null)}
                        className={cn(
                          "group cursor-grab rounded-[11px] border border-line bg-white p-3 shadow-[0_1px_2px_rgba(32,32,32,0.05)] transition-[box-shadow,opacity,transform] duration-150 hover:shadow-[var(--shadow-soft)] active:cursor-grabbing",
                          dragId === lead.id && "rotate-1 opacity-50",
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <GripVertical className="mt-0.5 size-3.5 shrink-0 text-line-strong group-hover:text-subtle" aria-hidden />
                          <button type="button" onClick={() => setSelectedId(lead.id)} className="min-w-0 flex-1 text-left">
                            <p className="truncate text-[13.5px] font-semibold">{lead.name}</p>
                            <p className="truncate text-[12px] text-muted">{lead.interest}</p>
                          </button>
                          <DropdownMenu
                            label={`Mover ${lead.name}`}
                            items={LEAD_STAGES.filter((s) => s.id !== lead.stage).map((s) => ({ label: `Mover para ${s.label}`, onSelect: () => void move(lead.id, s.id) }))}
                          />
                        </div>
                        <button type="button" onClick={() => setSelectedId(lead.id)} className="mt-2.5 block w-full text-left">
                          <div className="flex items-center justify-between text-[12px]">
                            <span className="rounded-full bg-gold-soft px-2 py-0.5 font-medium text-gold-dark">{LEAD_SOURCE_LABELS[lead.source]}</span>
                            <span className="font-semibold tabular">{formatCurrency(lead.potentialValue)}</span>
                          </div>
                          <div className="mt-2.5 flex items-center justify-between text-[11.5px] text-subtle">
                            <span className="tabular">{formatPhone(lead.phone)}</span>
                            <span className="flex items-center gap-1.5">
                              {lead.lastContactAt ? formatRelative(lead.lastContactAt) : "—"}
                              <Avatar name={lookups.userName(lead.ownerId)} size="xs" />
                            </span>
                          </div>
                        </button>
                      </li>
                    ))}
                    {items.length === 0 ? (
                      <li className="rounded-[11px] border border-dashed border-line-strong/70 px-3 py-6 text-center text-[12px] text-subtle">Solte um card aqui</li>
                    ) : null}
                  </ul>
                </section>
              );
            })}
          </div>
        </div>
      )}

      <LeadDrawer
        lead={selected}
        onClose={() => setSelectedId(null)}
        onEdit={(l) => {
          setEditing(l);
          setFormOpen(true);
        }}
      />
      <LeadFormDialog open={formOpen} onClose={() => setFormOpen(false)} lead={editing} />
    </div>
  );
}
