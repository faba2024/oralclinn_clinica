import type { CreateInput, Entity, UpdateInput } from "@/types/common";

/**
 * Backend de dados plugável.
 * - No navegador: ApiBackend (HTTP → /api/admin/*), dados no servidor.
 * - No servidor (rotas /api e páginas): ServerBackend (Supabase/arquivo).
 * Telas, hooks e services são os mesmos nos dois lados.
 */
export interface DataBackend {
  readonly kind: "api" | "server";
  list<T extends Entity>(collection: string, seed: () => T[]): Promise<T[]>;
  getById<T extends Entity>(collection: string, id: string, seed: () => T[]): Promise<T | null>;
  create<T extends Entity>(collection: string, input: CreateInput<T>, idPrefix: string): Promise<T>;
  update<T extends Entity>(collection: string, id: string, patch: UpdateInput<T>): Promise<T>;
  remove(collection: string, id: string): Promise<void>;
  getDoc<T extends object>(key: string, seed: () => T): Promise<T>;
  saveDoc<T extends object>(key: string, value: T): Promise<T>;
}

const GLOBAL_KEY = "__oralclinDataBackend";
type GlobalWithBackend = typeof globalThis & { [GLOBAL_KEY]?: DataBackend };

let clientFactory: (() => DataBackend) | null = null;

/** Registrado pelo módulo do ApiBackend (lado do navegador). */
export function registerClientBackendFactory(factory: () => DataBackend) {
  clientFactory = factory;
}

export function setDataBackend(backend: DataBackend) {
  (globalThis as GlobalWithBackend)[GLOBAL_KEY] = backend;
}

export function getDataBackend(): DataBackend {
  const g = globalThis as GlobalWithBackend;
  if (!g[GLOBAL_KEY]) {
    if (typeof window !== "undefined" && clientFactory) g[GLOBAL_KEY] = clientFactory();
    else throw new Error("Backend de dados não inicializado. No servidor, importe '@/server/bootstrap' antes de usar os services.");
  }
  return g[GLOBAL_KEY]!;
}

export class NotFoundError extends Error {
  constructor(collection: string, id: string) {
    super(`Registro ${id} não encontrado em ${collection}.`);
    this.name = "NotFoundError";
  }
}
