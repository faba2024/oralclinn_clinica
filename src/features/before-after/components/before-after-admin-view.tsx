"use client";

import { Eye, EyeOff, Images, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useLookups } from "@/hooks/use-lookups";
import { toast } from "@/stores/toast-store";
import { formatDate } from "@/utils/format";
import { useBeforeAfter } from "../hooks";
import { beforeAfterService, RESULT_DISCLAIMER } from "../service";
import type { BeforeAfterCase } from "../types";
import { BeforeAfterSlider } from "./before-after-slider";
import { CaseFormDialog } from "./case-form-dialog";

export function BeforeAfterAdminView() {
  const { data, loading } = useBeforeAfter();
  const lookups = useLookups();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BeforeAfterCase | null>(null);
  const [toDelete, setToDelete] = useState<BeforeAfterCase | null>(null);

  const togglePublish = async (c: BeforeAfterCase) => {
    if (!c.published && !c.consentConfirmed) {
      toast.error("Autorização pendente", "Confirme a autorização de uso de imagem antes de publicar.");
      setEditing(c);
      setFormOpen(true);
      return;
    }
    await beforeAfterService.update(c.id, { published: !c.published });
    toast.success(c.published ? "Removido do site" : "Publicado no site", c.title);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Antes e Depois"
        description="Casos clínicos exibidos na galeria do site."
        actions={
          <>
            <Link href="/antes-e-depois" target="_blank" className={buttonVariants({ variant: "secondary" })}>
              <Eye /> Ver galeria
            </Link>
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus /> Novo caso
            </Button>
          </>
        }
      />

      {loading && !data ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      ) : !data?.length ? (
        <EmptyState icon={<Images />} title="Nenhum caso cadastrado" description="Cadastre fotos de antes e depois com autorização do paciente." />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((c) => (
            <li key={c.id} className="overflow-hidden rounded-[14px] border border-line bg-white shadow-[var(--shadow-card)]">
              <BeforeAfterSlider before={c.beforeImage} after={c.afterImage} alt={c.title} className="rounded-none" aspect="aspect-[16/10]" />
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[14.5px] font-semibold">{c.title}</p>
                    <p className="text-[12px] text-muted">
                      {lookups.treatmentName(c.treatmentId)} · {lookups.professionalName(c.professionalId)} · {formatDate(c.date)}
                    </p>
                  </div>
                  <DropdownMenu
                    items={[
                      { label: "Editar", icon: <Pencil />, onSelect: () => { setEditing(c); setFormOpen(true); } },
                      { label: c.published ? "Despublicar" : "Publicar", icon: c.published ? <EyeOff /> : <Eye />, onSelect: () => void togglePublish(c) },
                      { label: "Excluir", icon: <Trash2 />, danger: true, separatorBefore: true, onSelect: () => setToDelete(c) },
                    ]}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge tone={c.published ? "success" : "neutral"} dot>
                    {c.published ? "Publicado" : "Rascunho"}
                  </Badge>
                  <Badge tone={c.consentConfirmed ? "gold" : "warning"}>{c.consentConfirmed ? "Autorização assinada" : "Sem autorização"}</Badge>
                  {c.patientId ? <Badge>{lookups.patientName(c.patientId)}</Badge> : <Badge>Anônimo</Badge>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-6 text-center text-[12px] text-subtle">No site, todos os casos exibem o aviso: “{RESULT_DISCLAIMER}”</p>

      <CaseFormDialog open={formOpen} onClose={() => setFormOpen(false)} item={editing} />
      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Excluir caso?"
        description="As fotos e informações deste caso serão removidas."
        onConfirm={async () => {
          if (toDelete) await beforeAfterService.remove(toDelete.id);
          toast.success("Caso excluído");
        }}
      />
    </div>
  );
}
