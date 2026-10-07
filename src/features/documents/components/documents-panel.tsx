"use client";

import { Download, Eye, FileText, Paperclip, Trash2, Upload } from "lucide-react";
import { SafeImage } from "@/components/shared/safe-image";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "@/stores/toast-store";
import { cn } from "@/utils/cn";
import { formatDate, formatFileSize } from "@/utils/format";
import { usePatientDocuments } from "../hooks";
import { documentService } from "../service";
import { DOCUMENT_CATEGORIES, DOCUMENT_CATEGORY_LABELS, type DocumentCategory, type PatientDocument } from "../types";

interface Props {
  patientId: string;
  /** Restringe às categorias de imagem (aba Fotos). */
  imagesOnly?: boolean;
}

export function DocumentsPanel({ patientId, imagesOnly }: Props) {
  const { data, loading } = usePatientDocuments(patientId);
  const user = useAuthStore((s) => s.user);
  const inputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<DocumentCategory>(imagesOnly ? "fotos" : "documentos");
  const [filter, setFilter] = useState<DocumentCategory | "todos">("todos");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<PatientDocument | null>(null);
  const [toDelete, setToDelete] = useState<PatientDocument | null>(null);

  const all = (data ?? []).filter((d) => (imagesOnly ? d.mimeType.startsWith("image/") : true));
  const docs = all.filter((d) => filter === "todos" || d.category === filter);
  const categories = imagesOnly ? (["fotos", "radiografias", "exames"] as DocumentCategory[]) : DOCUMENT_CATEGORIES;

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await documentService.upload(patientId, file, category, user?.name ?? "Equipe");
      }
      toast.success(files.length > 1 ? `${files.length} arquivos enviados` : "Arquivo enviado", DOCUMENT_CATEGORY_LABELS[category]);
    } catch (e) {
      toast.error("Falha no envio", e instanceof Error ? e.message : undefined);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {(["todos", ...categories] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              aria-pressed={filter === c}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[12px] font-medium transition-colors",
                filter === c ? "border-ink bg-ink text-white" : "border-line text-ink-2 hover:border-line-strong",
              )}
            >
              {c === "todos" ? "Todos" : DOCUMENT_CATEGORY_LABELS[c]}
              <span className="ml-1 opacity-60">{c === "todos" ? all.length : all.filter((d) => d.category === c).length}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-40">
            <Select value={category} onChange={(e) => setCategory(e.target.value as DocumentCategory)} aria-label="Categoria do envio">
              {categories.map((c) => (
                <option key={c} value={c}>
                  {DOCUMENT_CATEGORY_LABELS[c]}
                </option>
              ))}
            </Select>
          </div>
          <Button onClick={() => inputRef.current?.click()} loading={uploading}>
            <Upload /> Enviar
          </Button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={imagesOnly ? "image/*" : "image/*,application/pdf,.doc,.docx"}
            className="sr-only"
            aria-label="Selecionar arquivos"
            onChange={(e) => {
              void upload(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      <div
        className="p-4"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void upload(e.dataTransfer.files);
        }}
      >
        {loading && !data ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="aspect-[4/3]" />
            ))}
          </div>
        ) : docs.length === 0 ? (
          <EmptyState
            icon={<Paperclip />}
            title={imagesOnly ? "Nenhuma foto registrada" : "Nenhum documento"}
            description="Arraste arquivos para cá ou use o botão Enviar. Imagens são otimizadas automaticamente; PDFs até 900 KB."
          />
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {docs.map((d) => {
              const isImage = d.mimeType.startsWith("image/");
              return (
                <li key={d.id} className="group overflow-hidden rounded-[12px] border border-line bg-white">
                  <button type="button" onClick={() => setPreview(d)} className="relative block aspect-[4/3] w-full bg-ivory" aria-label={`Visualizar ${d.name}`}>
                    {isImage ? (
                      <SafeImage fallback="clinic" src={d.url} alt={d.name} fill sizes="240px" className="object-cover" />
                    ) : (
                      <span className="flex h-full items-center justify-center text-gold-dark">
                        <FileText className="size-8" />
                      </span>
                    )}
                    <span className="absolute inset-0 flex items-center justify-center bg-ink/0 text-white opacity-0 transition-all group-hover:bg-ink/25 group-hover:opacity-100">
                      <Eye className="size-5" />
                    </span>
                  </button>
                  <div className="flex items-start gap-2 p-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-medium">{d.name}</p>
                      <p className="text-[11px] text-subtle">
                        {formatDate(d.createdAt)} · {formatFileSize(d.size)}
                      </p>
                      <Badge className="mt-1.5" tone="neutral">
                        {DOCUMENT_CATEGORY_LABELS[d.category]}
                      </Badge>
                    </div>
                    <button type="button" onClick={() => setToDelete(d)} className="rounded-md p-1 text-subtle hover:bg-danger-soft hover:text-danger" aria-label={`Excluir ${d.name}`}>
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Dialog
        open={!!preview}
        onClose={() => setPreview(null)}
        title={preview?.name ?? ""}
        description={preview ? `${DOCUMENT_CATEGORY_LABELS[preview.category]} · enviado por ${preview.uploadedBy} em ${formatDate(preview.createdAt)}` : undefined}
        size="lg"
        footer={
          preview ? (
            <a href={preview.url} download={preview.name} className="inline-flex h-9 items-center gap-2 rounded-[10px] bg-ink px-3.5 text-sm font-medium text-white hover:bg-ink-2">
              <Download className="size-4" /> Baixar arquivo
            </a>
          ) : null
        }
      >
        {preview?.mimeType.startsWith("image/") ? (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[12px] bg-ivory">
            <SafeImage fallback="clinic" src={preview.url} alt={preview.name} fill sizes="800px" className="object-contain" />
          </div>
        ) : preview?.mimeType === "application/pdf" ? (
          <iframe src={preview.url} title={preview.name} className="h-[60vh] w-full rounded-[12px] border border-line" />
        ) : (
          <p className="text-sm text-muted">Pré-visualização indisponível para este formato. Utilize “Baixar arquivo”.</p>
        )}
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Excluir arquivo?"
        description={`“${toDelete?.name}” será removido permanentemente do cadastro do paciente.`}
        onConfirm={async () => {
          if (toDelete) await documentService.remove(toDelete);
          toast.success("Arquivo excluído");
        }}
      />
    </Card>
  );
}
