"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/checkbox";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select } from "@/components/ui/input";
import { toast } from "@/stores/toast-store";
import type { PaymentMethod } from "@/types/common";
import { PAYMENT_METHOD_LABELS, PAYMENT_METHODS } from "@/types/labels";
import { todayISO } from "@/utils/dates";
import { financeService } from "../service";
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_LABELS, type Expense, type ExpenseCategory } from "../types";

const schema = z.object({
  category: z.enum(EXPENSE_CATEGORIES as [ExpenseCategory, ...ExpenseCategory[]]),
  description: z.string().trim().min(3, "Descreva a despesa"),
  supplier: z.string().trim(),
  amount: z.number({ invalid_type_error: "Informe o valor" }).positive("Valor deve ser maior que zero"),
  date: z.string().min(1, "Informe a data"),
  method: z.enum(PAYMENT_METHODS as [PaymentMethod, ...PaymentMethod[]]),
  paid: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function ExpenseFormDialog({ open, onClose, expense }: { open: boolean; onClose: () => void; expense?: Expense | null }) {
  const empty: FormValues = { category: "material", description: "", supplier: "", amount: 0, date: todayISO(), method: "pix", paid: true };
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: empty });

  useEffect(() => {
    if (!open) return;
    reset(
      expense
        ? { category: expense.category, description: expense.description, supplier: expense.supplier, amount: expense.amount, date: expense.date, method: expense.method, paid: expense.paid }
        : empty,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, expense?.id]);

  const onSubmit = async (v: FormValues) => {
    if (expense) await financeService.updateExpense(expense.id, v);
    else await financeService.createExpense(v);
    toast.success(expense ? "Despesa atualizada" : "Despesa registrada", v.description);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={expense ? "Editar despesa" : "Nova despesa"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="expense-form" loading={isSubmitting}>
            Salvar despesa
          </Button>
        </>
      }
    >
      <form id="expense-form" onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
        <Field label="Categoria" htmlFor="e-cat">
          <Select id="e-cat" {...register("category")}>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {EXPENSE_CATEGORY_LABELS[c]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Fornecedor" htmlFor="e-sup">
          <Input id="e-sup" {...register("supplier")} />
        </Field>
        <Field label="Descrição" htmlFor="e-desc" error={errors.description?.message} required className="sm:col-span-2">
          <Input id="e-desc" aria-invalid={!!errors.description} {...register("description")} />
        </Field>
        <Field label="Valor (R$)" htmlFor="e-amount" error={errors.amount?.message} required>
          <Input id="e-amount" type="number" min={0} step="0.01" aria-invalid={!!errors.amount} {...register("amount", { valueAsNumber: true })} />
        </Field>
        <Field label="Data" htmlFor="e-date" error={errors.date?.message}>
          <Input id="e-date" type="date" {...register("date")} />
        </Field>
        <Field label="Forma de pagamento" htmlFor="e-method">
          <Select id="e-method" {...register("method")}>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {PAYMENT_METHOD_LABELS[m]}
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex items-end pb-1.5">
          <Controller control={control} name="paid" render={({ field }) => <Switch checked={field.value} onChange={field.onChange} label="Pago" />} />
        </div>
      </form>
    </Dialog>
  );
}
