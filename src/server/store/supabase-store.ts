import type { DataStore } from "./types";

interface SupabaseStoreOptions {
  url: string;
  serviceRoleKey: string;
}

/**
 * Persistência server-side via Supabase/PostgREST.
 *
 * O frontend nunca recebe a service role key: todo acesso passa pelas rotas/server
 * components deste projeto. As tabelas usadas são genéricas para preservar a
 * estrutura atual de coleções/documentos sem exigir reescrever cada módulo.
 */
export class SupabaseStore implements DataStore {
  readonly name = "supabase" as const;
  private readonly baseUrl: string;
  private readonly serviceRoleKey: string;

  constructor({ url, serviceRoleKey }: SupabaseStoreOptions) {
    this.baseUrl = url.replace(/\/$/, "");
    this.serviceRoleKey = serviceRoleKey;
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set("apikey", this.serviceRoleKey);
    headers.set("Authorization", `Bearer ${this.serviceRoleKey}`);
    if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

    const response = await fetch(`${this.baseUrl}/rest/v1/${path}`, {
      ...init,
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Supabase respondeu ${response.status}: ${body || response.statusText}`);
    }

    if (response.status === 204) return undefined as T;
    const text = await response.text();
    return (text ? JSON.parse(text) : undefined) as T;
  }

  async listCollection<T>(collection: string): Promise<T[] | null> {
    const encoded = encodeURIComponent(collection);
    const state = await this.request<{ initialized: boolean }[]>(
      `oralclin_collection_state?select=initialized&collection=eq.${encoded}&limit=1`,
    );
    if (!state[0]?.initialized) return null;

    const rows = await this.request<{ data: T }[]>(
      `oralclin_collection_items?select=data&collection=eq.${encoded}&order=updated_at.asc`,
    );
    return rows.map((row) => row.data);
  }

  async getItem<T>(collection: string, id: string): Promise<T | null> {
    const rows = await this.request<{ data: T }[]>(
      `oralclin_collection_items?select=data&collection=eq.${encodeURIComponent(collection)}&id=eq.${encodeURIComponent(id)}&limit=1`,
    );
    return rows[0]?.data ?? null;
  }

  async putItems<T extends { id: string }>(collection: string, items: T[], markInitialized = false): Promise<void> {
    if (items.length) {
      await this.request<void>("oralclin_collection_items?on_conflict=collection,id", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify(
          items.map((item) => ({
            collection,
            id: item.id,
            data: item,
            updated_at: new Date().toISOString(),
          })),
        ),
      });
    }

    if (markInitialized) {
      await this.request<void>("oralclin_collection_state?on_conflict=collection", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({ collection, initialized: true, updated_at: new Date().toISOString() }),
      });
    }
  }

  async deleteItem(collection: string, id: string): Promise<void> {
    await this.request<void>(
      `oralclin_collection_items?collection=eq.${encodeURIComponent(collection)}&id=eq.${encodeURIComponent(id)}`,
      { method: "DELETE", headers: { Prefer: "return=minimal" } },
    );
  }

  async getDoc<T>(key: string): Promise<T | null> {
    const rows = await this.request<{ data: T }[]>(
      `oralclin_docs?select=data&key=eq.${encodeURIComponent(key)}&limit=1`,
    );
    return rows[0]?.data ?? null;
  }

  async setDoc<T>(key: string, value: T): Promise<void> {
    await this.request<void>("oralclin_docs?on_conflict=key", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ key, data: value, updated_at: new Date().toISOString() }),
    });
  }

  async clearAll(): Promise<void> {
    await Promise.all([
      this.request<void>("oralclin_collection_items?collection=not.is.null", {
        method: "DELETE",
        headers: { Prefer: "return=minimal" },
      }),
      this.request<void>("oralclin_collection_state?collection=not.is.null", {
        method: "DELETE",
        headers: { Prefer: "return=minimal" },
      }),
      this.request<void>("oralclin_docs?key=not.is.null", {
        method: "DELETE",
        headers: { Prefer: "return=minimal" },
      }),
    ]);
  }
}
