import type { CreateInput, Entity, UpdateInput } from "@/types/common";
import { registerClientBackendFactory, type DataBackend } from "../core/backend";
import { dataBus } from "../core/data-bus";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Requisição JSON autenticada (cookie de sessão httpOnly enviado automaticamente). */
export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  if (res.status === 401 && typeof window !== "undefined" && window.location.pathname.startsWith("/admin") && !window.location.pathname.startsWith("/admin/login")) {
    window.location.assign(`/admin/login?next=${encodeURIComponent(window.location.pathname)}`);
    throw new ApiError("Sessão expirada.", 401);
  }
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) throw new ApiError(body?.error ?? `Erro ${res.status}`, res.status);
  return body as T;
}

const TTL = 1500;

/** Backend do navegador: todas as leituras e gravações passam pelas rotas /api/admin. */
export class ApiBackend implements DataBackend {
  readonly kind = "api" as const;
  private cache = new Map<string, { at: number; promise: Promise<unknown> }>();

  constructor() {
    if (typeof window !== "undefined") {
      dataBus.onRemoteChange((collection) => {
        this.cache.delete(`c:${collection}`);
        this.cache.delete(`d:${collection}`);
      });
    }
  }

  private cached<T>(key: string, loader: () => Promise<T>): Promise<T> {
    const hit = this.cache.get(key);
    if (hit && Date.now() - hit.at < TTL) return hit.promise as Promise<T>;
    const promise = loader().catch((e) => {
      this.cache.delete(key);
      throw e;
    });
    this.cache.set(key, { at: Date.now(), promise });
    return promise;
  }

  private invalidate(collection: string) {
    this.cache.delete(`c:${collection}`);
    this.cache.delete(`d:${collection}`);
    dataBus.emit(collection);
  }

  list<T extends Entity>(collection: string): Promise<T[]> {
    return this.cached(`c:${collection}`, () => apiFetch<T[]>(`/api/admin/data/${collection}`)).then((items) => [...items]);
  }

  async getById<T extends Entity>(collection: string, id: string): Promise<T | null> {
    const items = await this.list<T>(collection);
    return items.find((i) => i.id === id) ?? null;
  }

  async create<T extends Entity>(collection: string, input: CreateInput<T>): Promise<T> {
    const created = await apiFetch<T>(`/api/admin/data/${collection}`, { method: "POST", body: JSON.stringify(input) });
    this.invalidate(collection);
    return created;
  }

  async update<T extends Entity>(collection: string, id: string, patch: UpdateInput<T>): Promise<T> {
    const updated = await apiFetch<T>(`/api/admin/data/${collection}/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(patch) });
    this.invalidate(collection);
    return updated;
  }

  async remove(collection: string, id: string): Promise<void> {
    await apiFetch(`/api/admin/data/${collection}/${encodeURIComponent(id)}`, { method: "DELETE" });
    this.invalidate(collection);
  }

  getDoc<T extends object>(key: string): Promise<T> {
    return this.cached(`d:${key}`, () => apiFetch<T>(`/api/admin/doc/${key}`));
  }

  async saveDoc<T extends object>(key: string, value: T): Promise<T> {
    const saved = await apiFetch<T>(`/api/admin/doc/${key}`, { method: "PUT", body: JSON.stringify(value) });
    this.invalidate(key);
    return saved;
  }

  /** Descarta o cache (usado pelo polling e ao voltar para a aba). */
  clearCache() {
    this.cache.clear();
  }
}

registerClientBackendFactory(() => new ApiBackend());
