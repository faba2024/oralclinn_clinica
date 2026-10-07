import { addDays, format } from "date-fns";
import { repositories } from "@/repositories";
import { financeService } from "@/features/finance/service";
import type { PaymentMethod } from "@/types/common";
import { createId } from "@/utils/id";
import type { PlanItem, PlanStatus, PlanTotals, TreatmentPlan } from "./types";

export function itemTotal(item: PlanItem): number {
  return Math.max(0, item.quantity * item.unitPrice - item.discount);
}

export function planTotals(plan: Pick<TreatmentPlan, "items" | "globalDiscount">): PlanTotals {
  const subtotal = plan.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const itemDiscounts = plan.items.reduce((s, i) => s + i.discount, 0);
  const globalDiscount = plan.globalDiscount || 0;
  const discount = itemDiscounts + globalDiscount;
  return { subtotal, itemDiscounts, globalDiscount, discount, total: Math.max(0, subtotal - discount) };
}

export function emptyItem(): PlanItem {
  return { id: createId("pi"), treatmentId: null, procedure: "", region: "", quantity: 1, unitPrice: 0, discount: 0 };
}

export const budgetService = {
  list: async () => (await repositories.plans.list()).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  get: (id: string) => repositories.plans.getById(id),
  listByPatient: (patientId: string) => repositories.plans.listByPatient(patientId),

  async createDraft(patientId: string, professionalId: string): Promise<TreatmentPlan> {
    const [code, settings] = await Promise.all([repositories.plans.nextCode(), repositories.settings.get()]);
    return repositories.plans.create({
      code,
      patientId,
      professionalId,
      title: "Plano de tratamento",
      items: [emptyItem()],
      globalDiscount: 0,
      status: "rascunho",
      paymentTerms: settings.finance.defaultPaymentTerms,
      validUntil: format(addDays(new Date(), settings.finance.proposalValidityDays), "yyyy-MM-dd"),
      notes: "",
    });
  },

  save: (id: string, patch: Partial<TreatmentPlan>) => repositories.plans.update(id, patch),
  setStatus: (id: string, status: PlanStatus) => repositories.plans.update(id, { status }),
  remove: (id: string) => repositories.plans.remove(id),

  async duplicate(id: string): Promise<TreatmentPlan | null> {
    const plan = await repositories.plans.getById(id);
    if (!plan) return null;
    const code = await repositories.plans.nextCode();
    const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = plan;
    return repositories.plans.create({
      ...rest,
      code,
      status: "rascunho",
      items: plan.items.map((i) => ({ ...i, id: createId("pi") })),
    });
  },

  /** Gera o lançamento financeiro parcelado a partir de um plano aprovado. */
  async generateReceivable(id: string, installments: number, method: PaymentMethod, firstDueDate: string, firstPaid: boolean) {
    const plan = await repositories.plans.getById(id);
    if (!plan) return null;
    const totals = planTotals(plan);
    const receivable = await financeService.createReceivable({
      patientId: plan.patientId,
      treatmentId: plan.items.find((i) => i.treatmentId)?.treatmentId ?? null,
      planId: plan.id,
      professionalId: plan.professionalId,
      description: `${plan.code} — ${plan.title}`,
      total: totals.total,
      installmentsCount: installments,
      firstDueDate,
      method,
      firstPaid,
    });
    if (plan.status === "rascunho" || plan.status === "enviado") await repositories.plans.update(id, { status: "aprovado" });
    return receivable;
  },
};
