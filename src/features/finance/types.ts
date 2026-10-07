import type { Entity, PaymentMethod, Tone } from "@/types/common";

export type InstallmentStatus = "pago" | "pendente" | "atrasado";

export const INSTALLMENT_STATUS: Record<InstallmentStatus, { label: string; tone: Tone }> = {
  pago: { label: "Pago", tone: "success" },
  pendente: { label: "Pendente", tone: "warning" },
  atrasado: { label: "Atrasado", tone: "danger" },
};

export interface Installment {
  id: string;
  number: number;
  dueDate: string;
  amount: number;
  paidAt: string | null;
  method: PaymentMethod;
}

export interface Receivable extends Entity {
  patientId: string;
  treatmentId: string | null;
  planId: string | null;
  professionalId: string | null;
  description: string;
  method: PaymentMethod;
  installments: Installment[];
}

export type ExpenseCategory =
  | "material"
  | "laboratorio"
  | "funcionarios"
  | "aluguel"
  | "marketing"
  | "equipamentos"
  | "outros";

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  material: "Material odontológico",
  laboratorio: "Laboratório",
  funcionarios: "Funcionários",
  aluguel: "Aluguel",
  marketing: "Marketing",
  equipamentos: "Equipamentos",
  outros: "Outros",
};

export const EXPENSE_CATEGORIES = Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[];

export interface Expense extends Entity {
  category: ExpenseCategory;
  description: string;
  supplier: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  paid: boolean;
}

/** Parcela "achatada" com dados do lançamento — usada em tabelas e relatórios. */
export interface InstallmentRow extends Installment {
  receivableId: string;
  patientId: string;
  description: string;
  totalInstallments: number;
  status: InstallmentStatus;
  professionalId: string | null;
  treatmentId: string | null;
}

export interface FinanceSummary {
  revenue: number; // recebido no período
  expenses: number;
  profit: number;
  receivable: number; // pendente (não vencido + vencido)
  received: number;
  overdue: number;
}
