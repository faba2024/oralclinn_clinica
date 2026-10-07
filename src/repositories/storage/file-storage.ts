import { readFileAsDataUrl, readImageAsDataUrl } from "@/utils/image";

/**
 * Abstração de armazenamento de arquivos (fotos, radiografias, contratos).
 *
 * INTEGRAÇÃO FUTURA: implemente `FileStorage` com S3, Cloudflare R2, GCS
 * ou o storage do backend escolhido (upload via URL assinada) e troque a
 * instância exportada em `fileStorage`. Os módulos guardam apenas a `url`.
 */
export interface StoredFile {
  url: string;
  name: string;
  mimeType: string;
  size: number;
}

export interface FileStorage {
  upload(file: File, options?: { folder?: string; image?: boolean }): Promise<StoredFile>;
  remove(url: string): Promise<void>;
}

/**
 * Implementação atual: imagens são redimensionadas/comprimidas no navegador e o
 * arquivo vira data URL gravado junto ao registro no banco (Supabase/arquivo).
 */
class LocalFileStorage implements FileStorage {
  async upload(file: File, options?: { image?: boolean }): Promise<StoredFile> {
    const isImage = options?.image ?? file.type.startsWith("image/");
    const url = isImage ? await readImageAsDataUrl(file, 1400, 0.8) : await readFileAsDataUrl(file);
    return { url, name: file.name, mimeType: file.type || "application/octet-stream", size: file.size };
  }

  async remove(): Promise<void> {
    // Nada a fazer: o data URL é removido junto com o registro.
  }
}

export const fileStorage: FileStorage = new LocalFileStorage();

/** Limite para documentos (PDF etc.), mantido baixo porque o arquivo é salvo no banco. */
export const MAX_UPLOAD_BYTES = 900 * 1024;
