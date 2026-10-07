"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Segmented } from "@/components/ui/tabs";
import { patientService } from "@/features/patients/service";
import { professionalDisplayName } from "@/features/professionals/types";
import { useSettings } from "@/features/settings/hooks";
import { useLookups } from "@/hooks/use-lookups";
import { toast } from "@/stores/toast-store";
import { buildTimeSlots, todayISO } from "@/utils/dates";
import { formatPhone, maskPhone, onlyDigits } from "@/utils/format";
import { AppointmentConflictError, appointmentService } from "../service";
import {
  APPOINTMENT_PAYMENT_LABELS,
  APPOINTMENT_STATUS,
  APPOINTMENT_STATUSES,
  type Appointment,
  type AppointmentPaymentStatus,
  type AppointmentStatus,
} from "../types";

const schema = z
  .object({
    patientMode: z.enum(["existente", "novo"]),
    patientId: z.string().nullable(),
    newName: z.string(),
    newPhone: z.string(),
    professionalId: z.string().min(1, "Selecione o profissional"),
    treatmentId: z.string().min(1, "Selecione o procedimento"),
    room: z.string().min(1, "Selecione a sala"),
    date: z.string().min(1, "Informe a data"),
    start: z.string().min(1, "Informe o horário"),
    duration: z.number({ invalid_type_error: "Informe a duração" }).min(10, "Mínimo 10 min").max(480, "Máximo 8h"),
    price: z.number({ invalid_type_error: "Informe o valor" }).min(0, "Valor inválido"),
    status: z.enum(APPOINTMENT_STATUSES as [AppointmentStatus, ...AppointmentStatus[]]),
    paymentStatus: z.enum(["pendente", "pago", "parcial", "cortesia"]),
    notes: z.string().max(600, "Máximo de 600 caracteres"),
  })
  .superRefine((v, ctx) => {
    if (v.patientMode === "existente" && !v.patientId) ctx.addIssue({ code: "custom", path: ["patientId"], message: "Selecione o paciente" });
    if (v.patientMode === "novo") {
      if (v.newName.trim().length < 3) ctx.addIssue({ code: "custom", path: ["newName"], message: "Informe o nome completo" });
      if (onlyDigits(v.newPhone).length < 10) ctx.addIssue({ code: "custom", path: ["newPhone"], message: "Telefone inválido" });
    }
  });

type FormValues = z.infer<typeof schema>;

export interface AppointmentDefaults {
  date?: string;
  start?: string;
  professionalId?: string;
  patientId?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  appointment?: Appointment | null;
  defaults?: AppointmentDefaults;
  onSaved?: (appointment: Appointment) => void;
}

export function AppointmentFormDialog({ open, onClose, appointment, defaults, onSaved }: Props) {
  const lookups = useLookups();
  const { data: settings } = useSettings();
  const [conflict, setConflict] = useState<string | null>(null);
  const editing = !!appointment;

  const rooms = settings?.agenda.rooms ?? ["Consultório 1"];
  const slots = useMemo(
    () => buildTimeSlots(settings?.agenda.openTime ?? "07:00", settings?.agenda.closeTime ?? "20:00", 15),
    [settings?.agenda.openTime, settings?.agenda.closeTime],
  );

  const initial = (): FormValues => {
    if (appointment) {
      return {
        patientMode: "existente",
        patientId: appointment.patientId,
        newName: appointment.patientId ? "" : appointment.patientName,
        newPhone: appointment.patientId ? "" : appointment.patientPhone,
        professionalId: appointment.professionalId,
        treatmentId: appointment.treatmentId,
        room: appointment.room,
        date: appointment.date,
        start: appointment.start,
        duration: appointment.duration,
        price: appointment.price,
        status: appointment.status,
        paymentStatus: appointment.paymentStatus,
        notes: appointment.notes,
      };
    }
    const professionalId = defaults?.professionalId ?? "";
    return {
      patientMode: "existente",
      patientId: defaults?.patientId ?? null,
      newName: "",
      newPhone: "",
      professionalId,
      treatmentId: "",
      room: rooms[0] ?? "",
      date: defaults?.date ?? todayISO(),
      start: defaults?.start ?? "09:00",
      duration: 60,
      price: 0,
      status: "agendada",
      paymentStatus: "pendente",
      notes: "",
    };
  };

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: initial() });

  useEffect(() => {
    if (open) {
      reset(initial());
      setConflict(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, appointment?.id]);

  const mode = watch("patientMode");
  const professionalId = watch("professionalId");

  const treatmentOptions = useMemo(() => {
    const list = lookups.treatments.filter((t) => t.active);
    const forProf = professionalId ? list.filter((t) => t.professionalIds.includes(professionalId)) : list;
    return (forProf.length ? forProf : list).map((t) => ({ value: t.id, label: t.name, description: `${t.durationMinutes} min` }));
  }, [lookups.treatments, professionalId]);

  const onTreatmentChange = (id: string) => {
    const t = lookups.treatment(id);
    if (!t) return;
    setValue("duration", t.durationMinutes, { shouldValidate: true });
    if (!editing) setValue("price", t.priceFrom, { shouldValidate: true });
    if (!professionalId && t.professionalIds[0]) setValue("professionalId", t.professionalIds[0], { shouldValidate: true });
  };

  const onSubmit = async (values: FormValues) => {
    setConflict(null);
    try {
      let patientId = values.patientId;
      let patientName = "";
      let patientPhone = "";
      if (values.patientMode === "novo") {
        const created = await patientService.create({
          name: values.newName.trim(),
          phone: onlyDigits(values.newPhone),
          email: "",
          cpf: "",
          birthDate: "",
          gender: "",
          address: "",
          occupation: "",
          responsibleProfessionalId: values.professionalId,
          status: "novo",
          origin: "outro",
          importantNotes: "",
          tags: [],
        });
        patientId = created.id;
        patientName = created.name;
        patientPhone = created.phone;
      } else {
        const p = lookups.patient(patientId);
        patientName = p?.name ?? appointment?.patientName ?? "";
        patientPhone = p?.phone ?? appointment?.patientPhone ?? "";
      }
      const payload = {
        patientId,
        patientName,
        patientPhone,
        professionalId: values.professionalId,
        treatmentId: values.treatmentId,
        room: values.room,
        date: values.date,
        start: values.start,
        duration: values.duration,
        price: values.price,
        status: values.status,
        paymentStatus: values.paymentStatus as AppointmentPaymentStatus,
        notes: values.notes,
      };
      const saved = appointment
        ? await appointmentService.update(appointment.id, payload)
        : await appointmentService.create({ ...payload, source: "painel" });
      toast.success(editing ? "Consulta atualizada" : "Consulta agendada", `${saved.patientName} · ${saved.start}`);
      onSaved?.(saved);
      onClose();
    } catch (e) {
      if (e instanceof AppointmentConflictError) setConflict(e.message);
      else toast.error("Não foi possível salvar", e instanceof Error ? e.message : undefined);
    }
  };

  const patientOptions = lookups.patients
    .filter((p) => p.status !== "inativo" || p.id === appointment?.patientId)
    .map((p) => ({ value: p.id, label: p.name, description: formatPhone(p.phone), keywords: `${p.cpf} ${p.phone}`, leading: <Avatar name={p.name} size="xs" /> }));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title={editing ? "Editar consulta" : "Nova consulta"}
      description={editing ? "Alterações de data e horário verificam conflitos automaticamente." : "Preencha os dados do atendimento."}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="appointment-form" loading={isSubmitting}>
            {editing ? "Salvar alterações" : "Agendar consulta"}
          </Button>
        </>
      }
    >
      <form id="appointment-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <fieldset className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <legend className="text-[13px] font-semibold text-ink">Paciente</legend>
            {!editing ? (
              <Controller
                control={control}
                name="patientMode"
                render={({ field }) => (
                  <Segmented
                    size="sm"
                    label="Tipo de paciente"
                    value={field.value}
                    onChange={field.onChange}
                    options={[
                      { value: "existente", label: "Cadastrado" },
                      { value: "novo", label: "Novo paciente" },
                    ]}
                  />
                )}
              />
            ) : null}
          </div>
          {mode === "existente" ? (
            <Field htmlFor="patientId" error={errors.patientId?.message}>
              <Controller
                control={control}
                name="patientId"
                render={({ field }) => (
                  <Combobox
                    id="patientId"
                    options={patientOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Buscar por nome, telefone ou CPF"
                    searchPlaceholder="Nome, telefone ou CPF"
                    invalid={!!errors.patientId}
                    footer={(close) => (
                      <button
                        type="button"
                        onClick={() => {
                          close();
                          setValue("patientMode", "novo");
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] font-medium text-gold-dark hover:bg-gold-soft"
                      >
                        <UserPlus className="size-4" /> Cadastrar novo paciente
                      </button>
                    )}
                  />
                )}
              />
            </Field>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Nome completo" htmlFor="newName" error={errors.newName?.message} required>
                <Input id="newName" aria-invalid={!!errors.newName} {...register("newName")} />
              </Field>
              <Field label="WhatsApp" htmlFor="newPhone" error={errors.newPhone?.message} required>
                <Controller
                  control={control}
                  name="newPhone"
                  render={({ field }) => (
                    <Input id="newPhone" inputMode="tel" placeholder="(77) 99999-9999" aria-invalid={!!errors.newPhone} value={field.value} onChange={(e) => field.onChange(maskPhone(e.target.value))} />
                  )}
                />
              </Field>
            </div>
          )}
        </fieldset>

        <div className="h-px bg-line" />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Profissional" htmlFor="professionalId" error={errors.professionalId?.message} required>
            <Select id="professionalId" aria-invalid={!!errors.professionalId} {...register("professionalId")}>
              <option value="">Selecione</option>
              {lookups.professionals
                .filter((p) => p.status === "ativo")
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {professionalDisplayName(p)}
                  </option>
                ))}
            </Select>
          </Field>
          <Field label="Procedimento" htmlFor="treatmentId" error={errors.treatmentId?.message} required>
            <Controller
              control={control}
              name="treatmentId"
              render={({ field }) => (
                <Combobox
                  id="treatmentId"
                  options={treatmentOptions}
                  value={field.value || null}
                  onChange={(v) => {
                    field.onChange(v ?? "");
                    if (v) onTreatmentChange(v);
                  }}
                  placeholder="Selecionar procedimento"
                  invalid={!!errors.treatmentId}
                />
              )}
            />
          </Field>
          <Field label="Data" htmlFor="date" error={errors.date?.message} required>
            <Controller control={control} name="date" render={({ field }) => <DatePicker id="date" value={field.value} onChange={field.onChange} invalid={!!errors.date} />} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Início" htmlFor="start" error={errors.start?.message} required>
              <Select id="start" {...register("start")}>
                {slots.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Duração (min)" htmlFor="duration" error={errors.duration?.message} required>
              <Input id="duration" type="number" min={10} step={5} aria-invalid={!!errors.duration} {...register("duration", { valueAsNumber: true })} />
            </Field>
          </div>
          <Field label="Sala" htmlFor="room" error={errors.room?.message} required>
            <Select id="room" {...register("room")}>
              {rooms.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Valor (R$)" htmlFor="price" error={errors.price?.message}>
              <Input id="price" type="number" min={0} step={10} {...register("price", { valueAsNumber: true })} />
            </Field>
            <Field label="Pagamento" htmlFor="paymentStatus">
              <Select id="paymentStatus" {...register("paymentStatus")}>
                {Object.entries(APPOINTMENT_PAYMENT_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          {editing ? (
            <Field label="Status" htmlFor="status">
              <Select id="status" {...register("status")}>
                {APPOINTMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {APPOINTMENT_STATUS[s].label}
                  </option>
                ))}
              </Select>
            </Field>
          ) : null}
          <Field label="Observações" htmlFor="notes" error={errors.notes?.message} className="sm:col-span-2">
            <Textarea id="notes" rows={2} placeholder="Ex.: paciente prefere anestesia sem vasoconstritor" {...register("notes")} />
          </Field>
        </div>

        {conflict ? (
          <div role="alert" className="flex items-start gap-2.5 rounded-[10px] border border-warning/30 bg-warning-soft px-3.5 py-3 text-[13px] text-[#7a5520]">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <span>{conflict} Escolha outro horário, profissional ou sala.</span>
          </div>
        ) : null}
      </form>
    </Dialog>
  );
}
