"use client";

import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { SafeImage } from "@/components/shared/safe-image";
import { useId, useRef, useState } from "react";
import { fileStorage } from "@/repositories/storage/file-storage";
import { toast } from "@/stores/toast-store";
import { cn } from "@/utils/cn";

interface ImageUploadProps {
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  label?: string;
  aspect?: string;
  className?: string;
  hint?: string;
}

/** Seleção de imagem com preview. Persistência delegada ao FileStorage. */
export function ImageUpload({ value, onChange, label = "Enviar imagem", aspect = "aspect-[4/3]", className, hint }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Formato inválido", "Envie uma imagem JPG, PNG ou WebP.");
      return;
    }
    setLoading(true);
    try {
      const stored = await fileStorage.upload(file, { image: true });
      onChange(stored.url);
    } catch {
      toast.error("Não foi possível carregar a imagem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handleFile(e.dataTransfer.files[0]);
        }}
        className={cn(
          "group relative flex w-full items-center justify-center overflow-hidden rounded-[12px] border border-dashed bg-[radial-gradient(circle_at_30%_20%,#fffdf9,#f4f1eb_55%,#ece3d4)] transition-colors",
          aspect,
          dragging ? "border-gold bg-gold-soft" : "border-line-strong hover:border-gold",
        )}
      >
        {value ? (
          <>
            <SafeImage fallback="clinic" src={value} alt="Pré-visualização" fill sizes="400px" className="object-cover" />
            <div className="absolute inset-x-2 bottom-2 flex justify-end gap-1.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="rounded-lg bg-white/95 px-2.5 py-1.5 text-xs font-medium text-ink shadow"
              >
                Trocar
              </button>
              <button
                type="button"
                onClick={() => onChange(null)}
                className="rounded-lg bg-white/95 p-1.5 text-danger shadow"
                aria-label="Remover imagem"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-white/80 ring-1 ring-champagne">
              {loading ? <Loader2 className="size-5 animate-spin text-gold" /> : <ImagePlus className="size-5 text-gold-dark" />}
            </span>
            <span className="text-[13px] font-medium text-ink">{label}</span>
            <span className="text-[11.5px] text-subtle">{hint ?? "Arraste ou clique · JPG, PNG ou WebP"}</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label={label}
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
