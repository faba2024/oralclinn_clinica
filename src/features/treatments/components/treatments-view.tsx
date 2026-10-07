"use client";

import { Clock, Eye, EyeOff, Pencil, Plus, Search, Sparkles, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { TreatmentVisual } from "@/components/shared/treatment-visual";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Select } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useLookups } from "@/hooks/use-lookups";
import { toast } from "@/stores/toast-store";
import { cn } from "@/utils/cn";
import { formatCurrency, formatMinutes, matchesSearch } from "@/utils/format";
import { useTreatments } from "../hooks";
import { treatmentService } from "../service";
import { TREATMENT_CATEGORY_LABELS, type Treatment, type TreatmentCategory } from "../types";
import { TreatmentFormDialog } from "./treatment-form-dialog";

export function TreatmentsView() {
  const { data, loading } = useTreatments();
  const lookups = useLookups();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<TreatmentCategory | "">("");
  const [editing, setEditing] = useState<Treatment | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Treatment | null>(null);

  useEffect(() => {
    const id = params.get("editar");
    if (!id || !data) return;
    const t = data.find((x) => x.id === id);
    if (t) {
      setEditing(t);
      setFormOpen(true);
    }
    router.replace(pathname, { scroll: false });
  }, [params, data, router, pathname]);

  const list = useMemo(
    () => (data ?? []).filter((t) => (!category || t.category === category) && matchesSearch(query, t.name, t.shortDescription)),
    [data, category, query],
  );

  const toggle = async (t: Treatment, key: "active" | "featured") => {
    await treatmentService.update(t.id, { [key]: !t[key] });
    toast.success(key === "active" ? (t.active ? "Tratamento desativado" : "Tratamento ativado") : t.featured ? "Removido dos destaques" : "Adicionado aos destaques", t.name);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Tratamentos"
        description="Catálogo de procedimentos usado na agenda, nos orçamentos e no site."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus /> Novo tratamento
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="sm:w-72">
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar tratamento" leading={<Search />} aria-label="Buscar tratamento" />
        </div>
        <div className="sm:w-60">
          <Select value={category} onChange={(e) => setCategory(e.target.value as TreatmentCategory | "")} aria-label="Filtrar por categoria">
            <option value="">Todas as categorias</option>
            {Object.entries(TREATMENT_CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {loading && !data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState icon={<Sparkles />} title="Nenhum tratamento encontrado" description="Ajuste a busca ou cadastre um novo tratamento." />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((t) => (
            <li key={t.id} className={cn("group flex flex-col overflow-hidden rounded-[14px] border border-line bg-white shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-soft)]", !t.active && "opacity-70")}>
              <div className="relative">
                <TreatmentVisual slug={t.slug} category={t.category} name={t.name} image={t.image} className="aspect-[16/9]" />
                <div className="absolute left-3 top-3 flex gap-1.5">
                  {t.featured ? (
                    <Badge tone="gold" className="bg-white/90">
                      <Star className="size-3 fill-current" /> Destaque
                    </Badge>
                  ) : null}
                  {!t.active ? <Badge className="bg-white/90">Inativo</Badge> : null}
                </div>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold-dark">{TREATMENT_CATEGORY_LABELS[t.category]}</p>
                    <h3 className="mt-1 truncate text-[15px] font-semibold">{t.name}</h3>
                  </div>
                  <DropdownMenu
                    items={[
                      { label: "Editar", icon: <Pencil />, onSelect: () => { setEditing(t); setFormOpen(true); } },
                      { label: t.featured ? "Remover destaque" : "Destacar no site", icon: <Star />, onSelect: () => toggle(t, "featured") },
                      { label: t.active ? "Desativar" : "Ativar", icon: t.active ? <EyeOff /> : <Eye />, onSelect: () => toggle(t, "active") },
                      { label: "Excluir", icon: <Trash2 />, danger: true, separatorBefore: true, onSelect: () => setToDelete(t) },
                    ]}
                  />
                </div>
                <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted">{t.shortDescription}</p>
                <div className="mt-auto flex items-end justify-between gap-2 pt-4">
                  <div className="text-[12px] text-subtle">
                    <p className="flex items-center gap-1">
                      <Clock className="size-3" /> {formatMinutes(t.durationMinutes)} · {t.sessions}
                    </p>
                    <p className="mt-0.5 truncate">{t.professionalIds.map((id) => lookups.professional(id)?.name.split(" ")[0]).filter(Boolean).join(", ") || "Sem profissional"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-subtle">a partir de</p>
                    <p className="text-[15px] font-semibold tabular">{t.priceFrom ? formatCurrency(t.priceFrom) : "Sem custo"}</p>
                  </div>
                </div>
                <Link href={`/tratamentos/${t.slug}`} target="_blank" className="mt-3 text-[12px] font-medium text-gold-dark hover:underline">
                  Ver no site →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      <TreatmentFormDialog open={formOpen} onClose={() => setFormOpen(false)} treatment={editing} />
      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Excluir tratamento?"
        description={`“${toDelete?.name}” será removido do catálogo e do site. Consultas e orçamentos existentes não são alterados. Se preferir, apenas desative.`}
        onConfirm={async () => {
          if (toDelete) await treatmentService.remove(toDelete.id);
          toast.success("Tratamento excluído");
        }}
      />
    </div>
  );
}
