import { repositories } from "@/repositories";
import { fileStorage, MAX_UPLOAD_BYTES } from "@/repositories/storage/file-storage";
import type { DocumentCategory, PatientDocument } from "./types";

export const documentService = {
  listByPatient: async (patientId: string) =>
    (await repositories.documents.listByPatient(patientId)).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),

  async upload(patientId: string, file: File, category: DocumentCategory, uploadedBy: string): Promise<PatientDocument> {
    if (!file.type.startsWith("image/") && file.size > MAX_UPLOAD_BYTES) throw new Error("Arquivo acima de 900 KB. Reduza o tamanho (ou envie como imagem) e tente novamente.");
    const stored = await fileStorage.upload(file);
    return repositories.documents.create({
      patientId,
      category,
      name: stored.name,
      mimeType: stored.mimeType,
      size: stored.size,
      url: stored.url,
      description: "",
      uploadedBy,
    });
  },

  async remove(doc: PatientDocument) {
    await fileStorage.remove(doc.url);
    await repositories.documents.remove(doc.id);
  },
};
