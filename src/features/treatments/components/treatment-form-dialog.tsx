"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { ImageUpload } from "@/components/shared/image-upload";
import { Button } from "@/components/ui/button";
import { Checkbox, Switch } from "@/components/ui/checkbox";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { useProfessionals } from "@/features/professionals/hooks";
import { toast } from "@/stores/toast-store";
import { treatmentService } from "../service";
import { TREATMENT_CATEGORY_LABELS, type Treatment, type TreatmentCategory } from "../types";

const CATEGORIES = Object.keys(TREATMENT_CATEGORY_LABELS) as TreatmentCategory[];

const schema = z.object({
  name: z.string().trim().min(3, "Informe o nome"),
  category: z.enum(CATEGORIES as [TreatmentCategory, ...TreatmentCategory[]]),
  shortDescription: z.string().trim().min(10, "Mínimo de 10 caracteres").max(90, "Máximo de 90 caracteres — texto curto para o site"),
  description: z.string().trim().min(20, "Descreva o tratamento"),
  priceFrom: z.number({ invalid_type_error: "Informe o preço" }).min(0),
  durationMinutes: z.number({ invalid_type_error: "Informe a duração" }).min(10).max(480),
  sessions: z.string().trim().min(1, "Informe as sessões"),
  professionalIds: z.array(z.string()),
  image: z.string().nullable(),
  active: z.boolean(),
  featured: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const EMPTY: FormValues = {
  name: "",
  category: "estetica",
  shortDescription: "",
  description: "",
  priceFrom: 0,
  durationMinutes: 60,
  sessions: "1 sessão",
  professionalIds: [],
  image: null,
  active: true,
  featured: false,
};

interface Props {
  open: boolean;
  onClose: () => void;
  treatment?: Treatment | null;
}

export function TreatmentFormDialog({ open, onClose, treatment }: Props) {
  const { data: professionals = [] } = useProfessionals();
  const [benefits, setBenefits] = useState<string[]>([]);
  const [benefitDraft, setBenefitDraft] = useState("");
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY });

  useEffect(() => {
    if (!open) return;
    setBenefitDraft("");
    if (treatment) {
      reset({
        name: treatment.name,
        category: treatment.category,
        shortDescription: treatment.shortDescription,
        description: treatment.description,
        priceFrom: treatment.priceFrom,
        durationMinutes: treatment.durationMinutes,
        sessions: treatment.sessions,
        professionalIds: treatment.professionalIds,
        image: treatment.image ?? null,
        active: treatment.active,
        featured: treatment.featured,
      });
      setBenefits(treatment.benefits);
    } else {
      reset(EMPTY);
      setBenefits([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, treatment?.id]);

  const onSubmit = async (v: FormValues) => {
    const data = { ...v, image: v.image ?? undefined, benefits };
    if (treatment) await treatmentService.update(treatment.id, data);
    else await treatmentService.create(data);
    toast.success(treatment ? "Tratamento atualizado" : "Tratamento criado", v.name);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="xl"
      title={treatment ? "Editar tratamento" : "Novo tratamento"}
      description="As alterações aparecem imediatamente no site."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="treatment-form" loading={isSubmitting}>
            Salvar tratamento
          </Button>
        </>
      }
    >
      <form id="treatment-form" onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <Controller control={control} name="image" render={({ field }) => <ImageUpload value={field.value} onChange={field.onChange} label="Imagem do tratamento" />} />
          <div className="space-y-3 rounded-[12px] border border-line p-3.5">
            <Controller control={control} name="active" render={({ field }) => <Switch checked={field.value} onChange={field.onChange} label="Ativo" description="Disponível na agenda e no site" />} />
            <div className="h-px bg-line" />
            <Controller control={control} name="featured" render={({ field }) => <Switch checked={field.value} onChange={field.onChange} label="Destaque" description="Aparece na página inicial" />} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome" htmlFor="t-name" error={errors.name?.message} required>
            <Input id="t-name" aria-invalid={!!errors.name} {...register("name")} />
          </Field>
          <Field label="Categoria" htmlFor="t-cat">
            <Select id="t-cat" {...register("category")}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {TREATMENT_CATEGORY_LABELS[c]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Chamada curta" htmlFor="t-short" error={errors.shortDescription?.message} hint="Uma frase para os cards do site." required className="sm:col-span-2">
            <Input id="t-short" aria-invalid={!!errors.shortDescription} {...register("shortDescription")} />
          </Field>
          <Field label="Descrição" htmlFor="t-desc" error={errors.description?.message} required className="sm:col-span-2">
            <Textarea id="t-desc" rows={4} aria-invalid={!!errors.description} {...register("description")} />
          </Field>
          <Field label="Preço inicial (R$)" htmlFor="t-price" error={errors.priceFrom?.message} hint="Use 0 para avaliação sem custo.">
            <Input id="t-price" type="number" min={0} step={10} {...register("priceFrom", { valueAsNumber: true })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Duração (min)" htmlFor="t-dur" error={errors.durationMinutes?.message}>
              <Input id="t-dur" type="number" min={10} step={5} {...register("durationMinutes", { valueAsNumber: true })} />
            </Field>
            <Field label="Sessões" htmlFor="t-sess" error={errors.sessions?.message}>
              <Input id="t-sess" {...register("sessions")} />
            </Field>
          </div>
          <Field label="Profissionais" className="sm:col-span-2">
            <Controller
              control={control}
              name="professionalIds"
              render={({ field }) => (
                <div className="flex flex-wrap gap-x-5 gap-y-2 rounded-[10px] border border-line p-3">
                  {professionals.map((p) => (
                    <Checkbox
                      key={p.id}
                      checked={field.value.includes(p.id)}
                      onChange={(checked) => field.onChange(checked ? [...field.value, p.id] : field.value.filter((id: string) => id !== p.id))}
                      label={`${p.title} ${p.name}`}
                    />
                  ))}
                </div>
              )}
            />
          </Field>
          <Field label="Benefícios" hint="Exibidos na página do tratamento." className="sm:col-span-2">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {benefits.map((b) => (
                  <span key={b} className="inline-flex items-center gap-1 rounded-full bg-sand px-2.5 py-1 text-[12px]">
                    {b}
                    <button type="button" onClick={() => setBenefits((list) => list.filter((x) => x !== b))} aria-label={`Remover ${b}`} className="text-subtle hover:text-danger">
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={benefitDraft}
                  onChange={(e) => setBenefitDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (benefitDraft.trim()) setBenefits((l) => [...l, benefitDraft.trim()]);
                      setBenefitDraft("");
                    }
                  }}
                  placeholder="Ex.: Planejamento digital"
                  aria-label="Novo benefício"
                />
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (benefitDraft.trim()) setBenefits((l) => [...l, benefitDraft.trim()]);
                    setBenefitDraft("");
                  }}
                >
                  <Plus /> Adicionar
                </Button>
              </div>
            </div>
          </Field>
        </div>
      </form>
    </Dialog>
  );
}
