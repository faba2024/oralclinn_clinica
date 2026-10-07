import { NotFoundError, type DataBackend } from "@/repositories/core/backend";
import type { CreateInput, Entity, UpdateInput } from "@/types/common";
import { createId } from "@/utils/id";
import { serverEnv } from "./env";
import { getStore } from "./store";

/** Coleções operacionais: começam vazias; só recebem dados de demonstração com SEED_DEMO_DATA=true. */
const DEMO_ONLY = new Set([
  "patients", "appointments", "leads", "clinical-records", "treatment-plans", "receivables", "expenses", "notifications", "documents",
]);

/** Backend executado no servidor: lê e grava diretamente no banco. */
export class ServerBackend implements DataBackend {
  readonly kind = "server" as const;

  async list<T extends Entity>(collection: string, seed: () => T[]): Promise<T[]> {
    const store = getStore();
    const items = await store.listCollection<T>(collection);
    if (items) return items;
    const initial = DEMO_ONLY.has(collection) && !serverEnv.seedDemoData ? [] : seed();
    await store.putItems(collection, initial, true);
    // Relê para incluir registros gravados antes da inicialização (ex.: agendamento feito pelo site).
    return (await store.listCollection<T>(collection)) ?? initial;
  }

  async getById<T extends Entity>(collection: string, id: string, seed: () => T[]): Promise<T | null> {
    const store = getStore();
    const item = await store.getItem<T>(collection, id);
    if (item) return item;
    // Garante a inicialização da coleção (seed) antes de concluir que não existe.
    const all = await this.list(collection, seed);
    return all.find((i) => i.id === id) ?? null;
  }

  async create<T extends Entity>(collection: string, input: CreateInput<T>, idPrefix: string): Promise<T> {
    const now = new Date().toISOString();
    const entity = { ...input, id: input.id ?? createId(idPrefix), createdAt: now, updatedAt: now } as T;
    await getStore().putItems(collection, [entity]);
    return entity;
  }

  async update<T extends Entity>(collection: string, id: string, patch: UpdateInput<T>): Promise<T> {
    const store = getStore();
    const current = await store.getItem<T>(collection, id);
    if (!current) throw new NotFoundError(collection, id);
    const updated = { ...current, ...patch, id, createdAt: current.createdAt, updatedAt: new Date().toISOString() } as T;
    await store.putItems(collection, [updated]);
    return updated;
  }

  async remove(collection: string, id: string): Promise<void> {
    await getStore().deleteItem(collection, id);
  }

  async getDoc<T extends object>(key: string, seed: () => T): Promise<T> {
    const store = getStore();
    const stored = await store.getDoc<T>(key);
    if (stored) return { ...seed(), ...stored };
    const value = seed();
    await store.setDoc(key, value);
    return value;
  }

  async saveDoc<T extends object>(key: string, value: T): Promise<T> {
    await getStore().setDoc(key, value);
    return value;
  }
}
