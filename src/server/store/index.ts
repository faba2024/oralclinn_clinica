import { serverEnv } from "../env";
import { FileStore } from "./file-store";
import { SupabaseStore } from "./supabase-store";
import type { DataStore } from "./types";

export type { DataStore } from "./types";

export class StorageNotConfiguredError extends Error {
  constructor() {
    super(
      "Banco de dados não configurado. Conecte o Supabase e defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nas variáveis de ambiente da Vercel.",
    );
    this.name = "StorageNotConfiguredError";
  }
}

const GLOBAL_KEY = "__oralclinStore";
type G = typeof globalThis & { [GLOBAL_KEY]?: DataStore };

/** Supabase em produção; arquivo local como fallback somente fora da Vercel. */
export function getStore(): DataStore {
  const g = globalThis as G;
  if (g[GLOBAL_KEY]) return g[GLOBAL_KEY]!;

  if (serverEnv.supabaseUrl && serverEnv.supabaseServiceRoleKey) {
    g[GLOBAL_KEY] = new SupabaseStore({
      url: serverEnv.supabaseUrl,
      serviceRoleKey: serverEnv.supabaseServiceRoleKey,
    });
  } else if (serverEnv.isVercel) {
    throw new StorageNotConfiguredError();
  } else {
    g[GLOBAL_KEY] = new FileStore(serverEnv.dataFile);
  }
  return g[GLOBAL_KEY]!;
}

export function storageStatus() {
  if (serverEnv.supabaseUrl && serverEnv.supabaseServiceRoleKey) {
    return { configured: true, driver: "supabase" as const };
  }
  if (serverEnv.isVercel) return { configured: false, driver: "none" as const };
  return { configured: true, driver: "file" as const };
}
