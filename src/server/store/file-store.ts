import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { DataStore } from "./types";

interface FileShape {
  collections: Record<string, Record<string, unknown>>;
  initialized: Record<string, boolean>;
  docs: Record<string, unknown>;
}

/**
 * Banco em arquivo JSON para desenvolvimento local (`npm run dev`).
 * Não é usado na Vercel (sistema de arquivos efêmero) — lá o Supabase é obrigatório.
 */
export class FileStore implements DataStore {
  readonly name = "file" as const;
  private queue: Promise<unknown> = Promise.resolve();
  private readonly path: string;

  constructor(path: string) {
    this.path = resolve(process.cwd(), path);
  }

  private async load(): Promise<FileShape> {
    try {
      return JSON.parse(await readFile(this.path, "utf8")) as FileShape;
    } catch {
      return { collections: {}, initialized: {}, docs: {} };
    }
  }

  private async save(data: FileShape) {
    await mkdir(dirname(this.path), { recursive: true });
    const tmp = `${this.path}.${process.pid}.tmp`;
    await writeFile(tmp, JSON.stringify(data));
    await rename(tmp, this.path);
  }

  /** Serializa as operações para evitar gravações concorrentes. */
  private run<R>(fn: (data: FileShape) => Promise<R> | R, write: boolean): Promise<R> {
    const next = this.queue.then(async () => {
      const data = await this.load();
      const result = await fn(data);
      if (write) await this.save(data);
      return result;
    });
    this.queue = next.catch(() => undefined);
    return next;
  }

  listCollection<T>(collection: string): Promise<T[] | null> {
    return this.run((d) => (d.initialized[collection] ? (Object.values(d.collections[collection] ?? {}) as T[]) : null), false);
  }

  getItem<T>(collection: string, id: string): Promise<T | null> {
    return this.run((d) => ((d.collections[collection]?.[id] as T) ?? null), false);
  }

  putItems<T extends { id: string }>(collection: string, items: T[], markInitialized = false): Promise<void> {
    return this.run((d) => {
      const col = (d.collections[collection] ??= {});
      items.forEach((item) => (col[item.id] = item));
      if (markInitialized) d.initialized[collection] = true;
    }, true);
  }

  deleteItem(collection: string, id: string): Promise<void> {
    return this.run((d) => {
      delete d.collections[collection]?.[id];
    }, true);
  }

  getDoc<T>(key: string): Promise<T | null> {
    return this.run((d) => (d.docs[key] as T) ?? null, false);
  }

  setDoc<T>(key: string, value: T): Promise<void> {
    return this.run((d) => {
      d.docs[key] = value;
    }, true);
  }

  clearAll(): Promise<void> {
    return this.run((d) => {
      d.collections = {};
      d.initialized = {};
      d.docs = {};
    }, true);
  }
}
