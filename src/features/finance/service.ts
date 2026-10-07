import { addMonths, endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { repositories } from "@/repositories";
import type { DateRange, PaymentMethod } from "@/types/common";
import { createId } from "@/utils/id";
import { todayISO } from "@/utils/dates";
import type { Expense, FinanceSummary, Installment, InstallmentRow, InstallmentStatus, Receivable } from "./types";

export function installmentStatus(installment: Installment, today = todayISO()): InstallmentStatus {
  if (installment.paidAt) return "pago";
  return installment.dueDate < today ? "atrasado" : "pendente";
}

export function receivableTotal(receivable: Receivable): number {
  return receivable.installments.reduce((sum, i) => sum + i.amount, 0);
}

export function receivablePaid(receivable: Receivable): number {
  return receivable.installments.filter((i) => i.paidAt).reduce((sum, i) => sum + i.amount, 0);
}

export function flattenInstallments(receivables: Receivable[]): InstallmentRow[] {
  const today = todayISO();
  return receivables.flatMap((r) =>
    r.installments.map((i) => ({
      ...i,
      receivableId: r.id,
      patientId: r.patientId,
      description: r.description,
      totalInstallments: r.installments.length,
      status: installmentStatus(i, today),
      professionalId: r.professionalId,
      treatmentId: r.treatmentId,
    })),
  );
}

export function splitInstallments(total: number, count: number, firstDue: string, method: PaymentMethod, paidFirst = false): Installment[] {
  const safeCount = Math.max(1, Math.min(48, Math.round(count)));
  const base = Math.floor((total / safeCount) * 100) / 100;
  const first = new Date(`${firstDue}T12:00:00`);
  return Array.from({ length: safeCount }, (_, i) => {
    const amount = i === safeCount - 1 ? Math.round((total - base * (safeCount - 1)) * 100) / 100 : base;
    return {
      id: createId("inst"),
      number: i + 1,
      dueDate: format(addMonths(first, i), "yyyy-MM-dd"),
      amount,
      paidAt: paidFirst && i === 0 ? todayISO() : null,
      method,
    };
  });
}

export interface NewReceivableInput {
  patientId: string;
  treatmentId: string | null;
  planId?: string | null;
  professionalId: string | null;
  description: string;
  total: number;
  installmentsCount: number;
  firstDueDate: string;
  method: PaymentMethod;
  firstPaid: boolean;
}

export function summarize(receivables: Receivable[], expenses: Expense[], range: DateRange): FinanceSummary {
  const rows = flattenInstallments(receivables);
  const inRange = (d: string) => d >= range.from && d <= range.to;
  const received = rows.filter((r) => r.paidAt && inRange(r.paidAt)).reduce((s, r) => s + r.amount, 0);
  const expenseTotal = expenses.filter((e) => inRange(e.date)).reduce((s, e) => s + e.amount, 0);
  const open = rows.filter((r) => !r.paidAt);
  const receivable = open.reduce((s, r) => s + r.amount, 0);
  const overdue = open.filter((r) => r.status === "atrasado").reduce((s, r) => s + r.amount, 0);
  return { revenue: received, received, expenses: expenseTotal, profit: received - expenseTotal, receivable, overdue };
}

export interface MonthlyPoint {
  key: string;
  label: string;
  receita: number;
  despesa: number;
  lucro: number;
}

export function monthlySeries(receivables: Receivable[], expenses: Expense[], months = 6): MonthlyPoint[] {
  const rows = flattenInstallments(receivables);
  return Array.from({ length: months }, (_, idx) => {
    const month = subMonths(new Date(), months - 1 - idx);
    const from = format(startOfMonth(month), "yyyy-MM-dd");
    const to = format(endOfMonth(month), "yyyy-MM-dd");
    const receita = rows.filter((r) => r.paidAt && r.paidAt >= from && r.paidAt <= to).reduce((s, r) => s + r.amount, 0);
    const despesa = expenses.filter((e) => e.date >= from && e.date <= to).reduce((s, e) => s + e.amount, 0);
    const label = format(month, "MMM", { locale: ptBR });
    return { key: format(month, "yyyy-MM"), label: label.charAt(0).toUpperCase() + label.slice(1).replace(".", ""), receita, despesa, lucro: receita - despesa };
  });
}

export const financeService = {
  listReceivables: () => repositories.receivables.list(),
  listExpenses: () => repositories.expenses.list(),
  listByPatient: (patientId: string) => repositories.receivables.listByPatient(patientId),

  async createReceivable(input: NewReceivableInput): Promise<Receivable> {
    return repositories.receivables.create({
      patientId: input.patientId,
      treatmentId: input.treatmentId,
      planId: input.planId ?? null,
      professionalId: input.professionalId,
      description: input.description,
      method: input.method,
      installments: splitInstallments(input.total, input.installmentsCount, input.firstDueDate, input.method, input.firstPaid),
    });
  },

  async setInstallmentPaid(receivableId: string, installmentId: string, paid: boolean, method?: PaymentMethod) {
    const receivable = await repositories.receivables.getById(receivableId);
    if (!receivable) return;
    const installments = receivable.installments.map((i) =>
      i.id === installmentId ? { ...i, paidAt: paid ? todayISO() : null, method: method ?? i.method } : i,
    );
    await repositories.receivables.update(receivableId, { installments });
  },

  removeReceivable: (id: string) => repositories.receivables.remove(id),

  createExpense: (input: Omit<Expense, "id" | "createdAt" | "updatedAt">) => repositories.expenses.create(input),
  updateExpense: (id: string, patch: Partial<Expense>) => repositories.expenses.update(id, patch),
  removeExpense: (id: string) => repositories.expenses.remove(id),
};
