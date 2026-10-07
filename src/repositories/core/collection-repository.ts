import type { CreateInput, Entity, UpdateInput } from "@/types/common";
import { getDataBackend } from "./backend";
import type { Repository, SingletonRepository } from "./repository";

/** Repositório de coleção: delega a persistência ao backend ativo (API ou servidor). */
export class CollectionRepository<T extends Entity> implements Repository<T> {
  constructor(
    readonly collection: string,
    readonly seed: () => T[],
    readonly idPrefix = "",
  ) {}

  list(): Promise<T[]> {
    return getDataBackend().list<T>(this.collection, this.seed);
  }

  getById(id: string): Promise<T | null> {
    return getDataBackend().getById<T>(this.collection, id, this.seed);
  }

  create(input: CreateInput<T>): Promise<T> {
    return getDataBackend().create<T>(this.collection, input, this.idPrefix);
  }

  update(id: string, patch: UpdateInput<T>): Promise<T> {
    return getDataBackend().update<T>(this.collection, id, patch);
  }

  remove(id: string): Promise<void> {
    return getDataBackend().remove(this.collection, id);
  }
}

export class SingletonDocRepository<T extends object> implements SingletonRepository<T> {
  constructor(
    readonly key: string,
    readonly seed: () => T,
  ) {}

  get(): Promise<T> {
    return getDataBackend().getDoc<T>(this.key, this.seed);
  }

  save(value: T): Promise<T> {
    return getDataBackend().saveDoc<T>(this.key, value);
  }

  async patch(value: Partial<T>): Promise<T> {
    return this.save({ ...(await this.get()), ...value });
  }
}
