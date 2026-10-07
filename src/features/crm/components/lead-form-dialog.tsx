"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { useLookups } from "@/hooks/use-lookups";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "@/stores/toast-store";
import type { LeadSource } from "@/types/common";
import { LEAD_SOURCE_LABELS, LEAD_SOURCES } from "@/types/labels";
import { maskPhone, onlyDigits } from "@/utils/format";
import { crmService } from "../service";
import { LEAD_STAGES, type Lead, type LeadStage } from "../types";

const schema = z.object({
  name: z.string().trim().min(3, "Informe o nome"),
  phone: z.string().refine((v) => onlyDigits(v).length >= 10, "WhatsApp inválido"),
  email: z.string().trim().email("E-mail inválido").or(z.literal("")),
  treatmentId: z.string(),
  interest: z.string().trim().min(2, "Informe o interesse"),
  source: z.enum(LEAD_SOURCES as [LeadSource, ...LeadSource[]]),
  stage: z.enum(LEAD_STAGES.map((s) => s.id) as [LeadStage, ...LeadStage[]]),
  potentialValue: z.number({ invalid_type_error: "Informe o valor" }).min(0),
  ownerId: z.string(),
  notes: z.string(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  lead?: Lead | null;
}

export function LeadFormDialog({ open, onClose, lead }: Props) {
  const lookups = useLookups();
  const user = useAuthStore((s) => s.user);
  const defaults: FormValues = {
    name: "",
    phone: "",
    email: "",
    treatmentId: "",
    interest: "",
    source: "instagram",
    stage: "novo",
    potentialValue: 0,
    ownerId: user?.id ?? "",
    notes: "",
  };
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: defaults });

  useEffect(() => {
    if (!open) return;
    reset(
      lead
        ? {
            name: lead.name,
            phone: maskPhone(lead.phone),
            email: lead.email,
            treatmentId: lead.treatmentId ?? "",
            interest: lead.interest,
            source: lead.source,
            stage: lead.stage,
            potentialValue: lead.potentialValue,
            ownerId: lead.ownerId,
            notes: lead.notes,
          }
        : defaults,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lead?.id]);

  const onSubmit = async (v: FormValues) => {
    const data = { ...v, phone: onlyDigits(v.phone), treatmentId: v.treatmentId || null };
    if (lead) await crmService.update(lead.id, data);
    else await crmService.create({ ...data, patientId: null }, user?.name ?? "Equipe");
    toast.success(lead ? "Lead atualizado" : "Lead cadastrado", v.name);
    onClose();
  };

  const commercialUsers = lookups.users.filter((u) => ["admin", "comercial", "recepcao"].includes(u.role));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title={lead ? "Editar lead" : "Novo lead"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="lead-form" loading={isSubmitting}>
            {lead ? "Salvar" : "Cadastrar lead"}
          </Button>
        </>
      }
    >
      <form id="lead-form" onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome" htmlFor="l-name" error={errors.name?.message} required className="sm:col-span-2">
          <Input id="l-name" aria-invalid={!!errors.name} {...register("name")} />
        </Field>
        <Field label="WhatsApp" htmlFor="l-phone" error={errors.phone?.message} required>
          <Controller
            control={control}
            name="phone"
            render={({ field }) => <Input id="l-phone" inputMode="tel" placeholder="(77) 99999-9999" aria-invalid={!!errors.phone} value={field.value} onChange={(e) => field.onChange(maskPhone(e.target.value))} />}
          />
        </Field>
        <Field label="E-mail" htmlFor="l-email" error={errors.email?.message}>
          <Input id="l-email" type="email" {...register("email")} />
        </Field>
        <Field label="Tratamento de interesse" htmlFor="l-trt">
          <Select
            id="l-trt"
            {...register("treatmentId")}
            onChange={(e) => {
              setValue("treatmentId", e.target.value);
              const t = lookups.treatment(e.target.value);
              if (t) {
                setValue("interest", t.name, { shouldValidate: true });
                setValue("potentialValue", t.priceFrom);
              }
            }}
          >
            <option value="">Outro</option>
            {lookups.treatments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Interesse (descrição)" htmlFor="l-interest" error={errors.interest?.message} required>
          <Input id="l-interest" {...register("interest")} />
        </Field>
        <Field label="Origem" htmlFor="l-source">
          <Select id="l-source" {...register("source")}>
            {LEAD_SOURCES.map((s) => (
              <option key={s} value={s}>
                {LEAD_SOURCE_LABELS[s]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Etapa" htmlFor="l-stage">
          <Select id="l-stage" {...register("stage")}>
            {LEAD_STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Valor potencial (R$)" htmlFor="l-value" error={errors.potentialValue?.message}>
          <Input id="l-value" type="number" min={0} step={100} {...register("potentialValue", { valueAsNumber: true })} />
        </Field>
        <Field label="Responsável" htmlFor="l-owner">
          <Select id="l-owner" {...register("ownerId")}>
            {commercialUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Observações" htmlFor="l-notes" className="sm:col-span-2">
          <Textarea id="l-notes" rows={2} {...register("notes")} />
        </Field>
      </form>
    </Dialog>
  );
}
