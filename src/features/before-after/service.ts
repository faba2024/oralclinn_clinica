import { repositories } from "@/repositories";
import type { CreateInput } from "@/types/common";
import type { BeforeAfterCase } from "./types";

export const RESULT_DISCLAIMER = "Resultados podem variar conforme as características de cada paciente.";

export const beforeAfterService = {
  list: async () => (await repositories.beforeAfter.list()).sort((a, b) => b.date.localeCompare(a.date)),
  listPublished: async () => (await beforeAfterService.list()).filter((c) => c.published && c.consentConfirmed),
  create: (input: CreateInput<BeforeAfterCase>) => repositories.beforeAfter.create(input),
  update: (id: string, patch: Partial<BeforeAfterCase>) => repositories.beforeAfter.update(id, patch),
  remove: (id: string) => repositories.beforeAfter.remove(id),
};
