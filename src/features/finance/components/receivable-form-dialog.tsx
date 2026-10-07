"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select } from "@/components/ui/input";
import { useLookups } from "@/hooks/use-lookups";
import { toast } from "@/stores/toast-store";
import type { PaymentMethod } from "@/types/common";
import { PAYMENT_METHOD_LABELS, PAYMENT_METHODS } from "@/types/labels";
import { todayISO } from "@/utils/dates";
import { formatCurrency, formatPhone } from "@/utils/format";
import { financeService, splitInstallments } from "../service";

const schema = z.object({
  patientId: z.string().min(1, "Selecione o paciente"),
  treatmentId: z.string(),
  professionalId: z.string(),
  description: z.string().trim().min(3, "Descreva o lançamento"),
  total: z.number({ invalid_type_error: "Informe o valor" }).positive("Valor deve ser maior que zero"),
  installments: z.number({ invalid_type_error: "Informe as parcelas" }).int().min(1).max(24, "Máximo de 24 parcelas"),
  firstDueDate: z.string().min(1, "Informe o vencimento"),
  method: z.enum(PAYMENT_METHODS as [PaymentMethod, ...PaymentMethod[]]),
  firstPaid: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  patientId?: string;
}

export function ReceivableFormDialog({ open, onClose, patientId }: Props) {
  const lookups = useLookups();
  const defaults: FormValues = {
    patientId: patientId ?? "",
    treatmentId: "",
    professionalId: "",
    description: "",
    total: 0,
    installments: 1,
    firstDueDate: todayISO(),
    method: "pix",
    firstPaid: false,
  };
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: defaults });

  useEffect(() => {
    if (open) reset(defaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, patientId]);

  const total = watch("total");
  const count = watch("installments");
  const firstDue = watch("firstDueDate");
  const method = watch("method");
  const preview = useMemo(
    () => (total > 0 && count >= 1 && count <= 24 && firstDue ? splitInstallments(total, count, firstDue, method) : []),
    [total, count, firstDue, method],
  );

  const onSubmit = async (v: FormValues) => {
    await financeService.createReceivable({
      patientId: v.patientId,
      treatmentId: v.treatmentId || null,
      professionalId: v.professionalId || null,
      description: v.description,
      total: v.total,
      installmentsCount: v.installments,
      firstDueDate: v.firstDueDate,
      method: v.method,
      firstPaid: v.firstPaid,
    });
    toast.success("Receita lançada", `${formatCurrency(v.total)} em ${v.installments}x`);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title="Nova receita"
      description="Lançamento com parcelamento automático."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="receivable-form" loading={isSubmitting}>
            Lançar receita
          </Button>
        </>
      }
    >
      <form id="receivable-form" onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
        <Field label="Paciente" htmlFor="r-patient" error={errors.patientId?.message} required className="sm:col-span-2">
          <Controller
            control={control}
            name="patientId"
            render={({ field }) => (
              <Combobox
                id="r-patient"
                value={field.value || null}
                onChange={(v) => field.onChange(v ?? "")}
                invalid={!!errors.patientId}
                placeholder="Selecionar paciente"
                options={lookups.patients.map((p) => ({ value: p.id, label: p.name, description: formatPhone(p.phone), leading: <Avatar name={p.name} size="xs" /> }))}
              />
            )}
          />
        </Field>
        <Field label="Tratamento" htmlFor="r-trt">
          <Select
            id="r-trt"
            {...register("treatmentId")}
            onChange={(e) => {
              setValue("treatmentId", e.target.value);
              const t = lookups.treatment(e.target.value);
              if (t) {
                setValue("description", t.name, { shouldValidate: true });
                if (t.professionalIds[0]) setValue("professionalId", t.professionalIds[0]);
              }
            }}
          >
            <option value="">Não vinculado</option>
            {lookups.treatments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Profissional" htmlFor="r-prof">
          <Select id="r-prof" {...register("professionalId")}>
            <option value="">Não vinculado</option>
            {lookups.professionals.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} {p.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Descrição" htmlFor="r-desc" error={errors.description?.message} required className="sm:col-span-2">
          <Input id="r-desc" aria-invalid={!!errors.description} {...register("description")} />
        </Field>
        <Field label="Valor total (R$)" htmlFor="r-total" error={errors.total?.message} required>
          <Input id="r-total" type="number" min={0} step="0.01" aria-invalid={!!errors.total} {...register("total", { valueAsNumber: true })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Parcelas" htmlFor="r-inst" error={errors.installments?.message}>
            <Input id="r-inst" type="number" min={1} max={24} {...register("installments", { valueAsNumber: true })} />
          </Field>
          <Field label="Forma" htmlFor="r-method">
            <Select id="r-method" {...register("method")}>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {PAYMENT_METHOD_LABELS[m]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Primeiro vencimento" htmlFor="r-due" error={errors.firstDueDate?.message}>
          <Input id="r-due" type="date" {...register("firstDueDate")} />
        </Field>
        <div className="flex items-end pb-2">
          <Controller
            control={control}
            name="firstPaid"
            render={({ field }) => <Checkbox checked={field.value} onChange={field.onChange} label="Primeira parcela já recebida" />}
          />
        </div>

        {preview.length > 0 ? (
          <div className="rounded-[12px] border border-line bg-ivory p-3 sm:col-span-2">
            <p className="mb-2 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-subtle">Prévia das parcelas</p>
            <ul className="scrollbar-thin grid max-h-36 gap-1 overflow-y-auto text-[12.5px] sm:grid-cols-2">
              {preview.map((p) => (
                <li key={p.id} className="flex justify-between rounded-md bg-white px-2.5 py-1.5 tabular">
                  <span className="text-muted">
                    {p.number}/{preview.length} · {p.dueDate.split("-").reverse().join("/")}
                  </span>
                  <span className="font-medium">{formatCurrency(p.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </form>
    </Dialog>
  );
}
