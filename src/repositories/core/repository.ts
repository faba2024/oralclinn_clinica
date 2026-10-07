import type { CreateInput, Entity, UpdateInput } from "@/types/common";

/**
 * Contrato genérico de repositório usado por services e telas.
 * A persistência real é decidida pelo DataBackend ativo.
 */
export interface Repository<T extends Entity> {
  list(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(input: CreateInput<T>): Promise<T>;
  update(id: string, patch: UpdateInput<T>): Promise<T>;
  remove(id: string): Promise<void>;
}

export interface SingletonRepository<T> {
  get(): Promise<T>;
  save(value: T): Promise<T>;
  patch(value: Partial<T>): Promise<T>;
}

export { NotFoundError } from "./backend";
