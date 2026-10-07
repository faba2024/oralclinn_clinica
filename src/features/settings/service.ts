import { repositories } from "@/repositories";
import { apiFetch } from "@/repositories/api/api-backend";
import { getDataBackend } from "@/repositories/core/backend";
import { dataBus } from "@/repositories/core/data-bus";
import type { ClinicSettings } from "./types";

const ALL_COLLECTIONS = [
  "patients", "professionals", "treatments", "appointments", "leads", "clinical-records", "treatment-plans",
  "receivables", "expenses", "before-after", "documents", "notifications", "users", "site-content", "settings",
];

export const settingsService = {
  get: () => repositories.settings.get(),
  save: (value: ClinicSettings) => repositories.settings.save(value),
  async patchSection<K extends keyof ClinicSettings>(key: K, value: ClinicSettings[K]) {
    const current = await repositories.settings.get();
    return repositories.settings.save({ ...current, [key]: value });
  },

  /** Restaura os dados iniciais no banco (somente administrador; usuários e senhas são mantidos). */
  async resetDemo() {
    await apiFetch("/api/admin/reset", { method: "POST" });
    const backend = getDataBackend() as { clearCache?: () => void };
    backend.clearCache?.();
    ALL_COLLECTIONS.forEach((c) => dataBus.emit(c));
  },
};
