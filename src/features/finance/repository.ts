import { CollectionRepository } from "@/repositories/core/collection-repository";
import type { Repository } from "@/repositories/core/repository";
import { seedExpenses, seedReceivables } from "@/data/seed";
import type { Expense, Receivable } from "./types";

export interface ReceivableRepository extends Repository<Receivable> {
  listByPatient(patientId: string): Promise<Receivable[]>;
}

export type ExpenseRepository = Repository<Expense>;

export class DefaultReceivableRepository extends CollectionRepository<Receivable> implements ReceivableRepository {
  constructor() {
    super("receivables", seedReceivables, "rec");
  }

  async listByPatient(patientId: string): Promise<Receivable[]> {
    return (await this.list()).filter((r) => r.patientId === patientId);
  }
}

export class DefaultExpenseRepository extends CollectionRepository<Expense> implements ExpenseRepository {
  constructor() {
    super("expenses", seedExpenses, "exp");
  }
}
