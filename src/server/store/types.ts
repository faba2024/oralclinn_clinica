/** Contrato do banco de dados (coleções + documentos). */
export interface DataStore {
  readonly name: "supabase" | "file";
  /** Retorna os itens da coleção ou `null` se a coleção nunca foi inicializada. */
  listCollection<T>(collection: string): Promise<T[] | null>;
  getItem<T>(collection: string, id: string): Promise<T | null>;
  putItems<T extends { id: string }>(collection: string, items: T[], markInitialized?: boolean): Promise<void>;
  deleteItem(collection: string, id: string): Promise<void>;
  getDoc<T>(key: string): Promise<T | null>;
  setDoc<T>(key: string, value: T): Promise<void>;
  /** Apaga todos os dados (restaurar demonstração). */
  clearAll(): Promise<void>;
}
