"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { ImageUpload } from "@/components/shared/image-upload";
import { Button } from "@/components/ui/button";
import { Checkbox, Switch } from "@/components/ui/checkbox";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { useTreatments } from "@/features/treatments/hooks";
import { toast } from "@/stores/toast-store";
import { cn } from "@/utils/cn";
import { maskPhone, onlyDigits } from "@/utils/format";
import { professionalService } from "../service";
import { WEEKDAY_SHORT, type Professional, type WorkingHours } from "../types";

const COLORS = ["#B69A67", "#4F6A80", "#6E8B74", "#9A6B5B", "#7A6F8E", "#5E7F86", "#202020"];

const schema = z.object({
  title: z.enum(["Dr.", "Dra.", "Fga.", "Fgo."]),
  name: z.string().trim().min(3, "Informe o nome"),
  cro: z.string().trim().min(4, "Informe o CRO"),
  specialty: z.string().trim().min(3, "Informe a especialidade"),
  phone: z.string(),
  email: z.string().trim().email("E-mail inválido").or(z.literal("")),
  bio: z.string().max(400, "Máximo de 400 caracteres"),
  photo: z.string().nullable(),
  color: z.string(),
  treatmentIds: z.array(z.string()),
  status: z.enum(["ativo", "inativo"]),
  commission: z.number({ invalid_type_error: "Informe a comissão" }).min(0).max(100),
  showOnSite: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const DEFAULT_HOURS: WorkingHours[] = [1, 2, 3, 4, 5].map((weekday) => ({ weekday, start: "08:00", end: "18:00" }));

interface Props {
  open: boolean;
  onClose: () => void;
  professional?: Professional | null;
}

export function ProfessionalFormDialog({ open, onClose, professional }: Props) {
  const { data: treatments = [] } = useTreatments();
  const [hours, onHoursChange] = useState<WorkingHours[]>(DEFAULT_HOURS);
  const empty: FormValues = {
    title: "Dra.",
    name: "",
    cro: "CRO-BA ",
    specialty: "",
    phone: "",
    email: "",
    bio: "",
    photo: null,
    color: COLORS[0],
    treatmentIds: [],
    status: "ativo",
    commission: 35,
    showOnSite: true,
  };
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: empty });

  useEffect(() => {
    if (!open) return;
    if (professional) {
      reset({
        title: professional.title,
        name: professional.name,
        cro: professional.cro,
        specialty: professional.specialty,
        phone: maskPhone(professional.phone),
        email: professional.email,
        bio: professional.bio,
        photo: professional.photo ?? null,
        color: professional.color,
        treatmentIds: professional.treatmentIds,
        status: professional.status,
        commission: Math.round(professional.commissionRate * 100),
        showOnSite: professional.showOnSite,
      });
      onHoursChange(professional.workingHours);
    } else {
      reset(empty);
      onHoursChange(DEFAULT_HOURS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, professional?.id]);

  const toggleDay = (weekday: number) => {
    onHoursChange(
      hours.some((h) => h.weekday === weekday)
        ? hours.filter((h) => h.weekday !== weekday)
        : [...hours, { weekday, start: "08:00", end: "18:00" }].sort((a, b) => a.weekday - b.weekday),
    );
  };

  const onSubmit = async (v: FormValues) => {
    const { commission, photo, ...rest } = v;
    const data = { ...rest, phone: onlyDigits(v.phone), photo: photo ?? undefined, commissionRate: commission / 100, workingHours: hours };
    if (professional) await professionalService.update(professional.id, data);
    else await professionalService.create(data);
    toast.success(professional ? "Profissional atualizado" : "Profissional cadastrado", `${v.title} ${v.name}`);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="xl"
      title={professional ? "Editar profissional" : "Novo profissional"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="professional-form" loading={isSubmitting}>
            Salvar
          </Button>
        </>
      }
    >
      <form id="professional-form" onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <div className="space-y-4">
          <Controller control={control} name="photo" render={({ field }) => <ImageUpload value={field.value} onChange={field.onChange} label="Foto profissional" aspect="aspect-[4/5]" />} />
          <Field label="Cor na agenda">
            <Controller
              control={control}
              name="color"
              render={({ field }) => (
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Cor na agenda">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      role="radio"
                      aria-checked={field.value === c}
                      aria-label={`Cor ${c}`}
                      onClick={() => field.onChange(c)}
                      className={cn("size-7 rounded-full ring-offset-2 transition-shadow", field.value === c && "ring-2 ring-ink")}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              )}
            />
          </Field>
          <div className="space-y-3 rounded-[12px] border border-line p-3">
            <Controller control={control} name="status" render={({ field }) => <Switch checked={field.value === "ativo"} onChange={(c) => field.onChange(c ? "ativo" : "inativo")} label="Ativo" />} />
            <div className="h-px bg-line" />
            <Controller control={control} name="showOnSite" render={({ field }) => <Switch checked={field.value} onChange={field.onChange} label="Exibir no site" />} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid grid-cols-[90px_1fr] gap-3 sm:col-span-2">
            <Field label="Título" htmlFor="pr-title">
              <Select id="pr-title" {...register("title")}>
                <option value="Dra.">Dra.</option>
                <option value="Fga.">Fga.</option>
                <option value="Fgo.">Fgo.</option>
                <option value="Dr.">Dr.</option>
              </Select>
            </Field>
            <Field label="Nome" htmlFor="pr-name" error={errors.name?.message} required>
              <Input id="pr-name" aria-invalid={!!errors.name} {...register("name")} />
            </Field>
          </div>
          <Field label="CRO" htmlFor="pr-cro" error={errors.cro?.message} required>
            <Input id="pr-cro" aria-invalid={!!errors.cro} {...register("cro")} />
          </Field>
          <Field label="Especialidade" htmlFor="pr-spec" error={errors.specialty?.message} required>
            <Input id="pr-spec" aria-invalid={!!errors.specialty} {...register("specialty")} />
          </Field>
          <Field label="Telefone" htmlFor="pr-phone">
            <Controller control={control} name="phone" render={({ field }) => <Input id="pr-phone" inputMode="tel" value={field.value} onChange={(e) => field.onChange(maskPhone(e.target.value))} />} />
          </Field>
          <Field label="E-mail" htmlFor="pr-email" error={errors.email?.message}>
            <Input id="pr-email" type="email" {...register("email")} />
          </Field>
          <Field label="Biografia" htmlFor="pr-bio" error={errors.bio?.message} hint="Texto curto exibido no site." className="sm:col-span-2">
            <Textarea id="pr-bio" rows={3} {...register("bio")} />
          </Field>
          <Field label="Comissão (%)" htmlFor="pr-comm" error={errors.commission?.message}>
            <Input id="pr-comm" type="number" min={0} max={100} {...register("commission", { valueAsNumber: true })} />
          </Field>

          <Field label="Horários de atendimento" className="sm:col-span-2">
            <div className="space-y-2 rounded-[12px] border border-line p-3">
              <div className="flex flex-wrap gap-1.5">
                {WEEKDAY_SHORT.map((d, i) => {
                  const on = hours.some((h) => h.weekday === i);
                  return (
                    <button
                      key={d}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggleDay(i)}
                      className={cn("h-8 w-11 rounded-lg border text-[12px] font-medium transition-colors", on ? "border-ink bg-ink text-white" : "border-line text-muted hover:border-line-strong")}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
              {hours.map((h) => (
                <div key={h.weekday} className="flex items-center gap-2 text-[13px]">
                  <span className="w-10 font-medium">{WEEKDAY_SHORT[h.weekday]}</span>
                  <Input type="time" value={h.start} onChange={(e) => onHoursChange(hours.map((x) => (x.weekday === h.weekday ? { ...x, start: e.target.value } : x)))} className="w-28" aria-label={`Início ${WEEKDAY_SHORT[h.weekday]}`} />
                  <span className="text-subtle">às</span>
                  <Input type="time" value={h.end} onChange={(e) => onHoursChange(hours.map((x) => (x.weekday === h.weekday ? { ...x, end: e.target.value } : x)))} className="w-28" aria-label={`Fim ${WEEKDAY_SHORT[h.weekday]}`} />
                </div>
              ))}
            </div>
          </Field>

          <Field label="Procedimentos realizados" className="sm:col-span-2">
            <Controller
              control={control}
              name="treatmentIds"
              render={({ field }) => (
                <div className="grid gap-2 rounded-[12px] border border-line p-3 sm:grid-cols-2">
                  {treatments.map((t) => (
                    <Checkbox
                      key={t.id}
                      checked={field.value.includes(t.id)}
                      onChange={(c) => field.onChange(c ? [...field.value, t.id] : field.value.filter((id: string) => id !== t.id))}
                      label={t.name}
                    />
                  ))}
                </div>
              )}
            />
          </Field>
        </div>
      </form>
    </Dialog>
  );
}
