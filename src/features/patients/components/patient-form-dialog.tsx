"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { useProfessionals } from "@/features/professionals/hooks";
import { professionalDisplayName } from "@/features/professionals/types";
import { toast } from "@/stores/toast-store";
import { LEAD_SOURCE_LABELS, LEAD_SOURCES } from "@/types/labels";
import type { LeadSource } from "@/types/common";
import { maskCpf, maskPhone, onlyDigits } from "@/utils/format";
import { patientService } from "../service";
import { PATIENT_STATUS_LABELS, type Patient, type PatientStatus } from "../types";

const schema = z.object({
  name: z.string().trim().min(3, "Informe o nome completo"),
  phone: z.string().refine((v) => onlyDigits(v).length >= 10, "Telefone inválido"),
  email: z.string().trim().email("E-mail inválido").or(z.literal("")),
  cpf: z.string().refine((v) => v === "" || onlyDigits(v).length === 11, "CPF deve ter 11 dígitos"),
  birthDate: z.string().refine((v) => v === "" || v <= new Date().toISOString().slice(0, 10), "Data inválida"),
  gender: z.enum(["feminino", "masculino", "outro", ""]),
  occupation: z.string(),
  address: z.string(),
  responsibleProfessionalId: z.string(),
  status: z.enum(["novo", "ativo", "em-tratamento", "inativo"]),
  origin: z.enum(LEAD_SOURCES as [LeadSource, ...LeadSource[]]),
  importantNotes: z.string().max(500, "Máximo de 500 caracteres"),
});

type FormValues = z.infer<typeof schema>;

const empty: FormValues = {
  name: "",
  phone: "",
  email: "",
  cpf: "",
  birthDate: "",
  gender: "",
  occupation: "",
  address: "",
  responsibleProfessionalId: "",
  status: "novo",
  origin: "instagram",
  importantNotes: "",
};

interface Props {
  open: boolean;
  onClose: () => void;
  patient?: Patient | null;
  onSaved?: (patient: Patient) => void;
}

export function PatientFormDialog({ open, onClose, patient, onSaved }: Props) {
  const { data: professionals = [] } = useProfessionals();
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: empty });

  useEffect(() => {
    if (!open) return;
    reset(
      patient
        ? {
            name: patient.name,
            phone: maskPhone(patient.phone),
            email: patient.email,
            cpf: patient.cpf ? maskCpf(patient.cpf) : "",
            birthDate: patient.birthDate,
            gender: patient.gender,
            occupation: patient.occupation,
            address: patient.address,
            responsibleProfessionalId: patient.responsibleProfessionalId,
            status: patient.status,
            origin: patient.origin,
            importantNotes: patient.importantNotes,
          }
        : empty,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, patient?.id]);

  const onSubmit = async (values: FormValues) => {
    const data = {
      ...values,
      name: values.name.trim(),
      phone: onlyDigits(values.phone),
      cpf: onlyDigits(values.cpf),
      status: values.status as PatientStatus,
    };
    try {
      const saved = patient
        ? await patientService.update(patient.id, data)
        : await patientService.create({ ...data, tags: [] });
      toast.success(patient ? "Cadastro atualizado" : "Paciente cadastrado", saved.name);
      onSaved?.(saved);
      onClose();
    } catch (e) {
      toast.error("Não foi possível salvar", e instanceof Error ? e.message : undefined);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title={patient ? "Editar paciente" : "Novo paciente"}
      description="Dados cadastrais e de contato."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="patient-form" loading={isSubmitting}>
            {patient ? "Salvar alterações" : "Cadastrar paciente"}
          </Button>
        </>
      }
    >
      <form id="patient-form" onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome completo" htmlFor="p-name" error={errors.name?.message} required className="sm:col-span-2">
          <Input id="p-name" autoComplete="off" aria-invalid={!!errors.name} {...register("name")} />
        </Field>
        <Field label="Telefone / WhatsApp" htmlFor="p-phone" error={errors.phone?.message} required>
          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <Input id="p-phone" inputMode="tel" placeholder="(77) 99999-9999" aria-invalid={!!errors.phone} value={field.value} onChange={(e) => field.onChange(maskPhone(e.target.value))} />
            )}
          />
        </Field>
        <Field label="E-mail" htmlFor="p-email" error={errors.email?.message}>
          <Input id="p-email" type="email" aria-invalid={!!errors.email} {...register("email")} />
        </Field>
        <Field label="CPF" htmlFor="p-cpf" error={errors.cpf?.message}>
          <Controller
            control={control}
            name="cpf"
            render={({ field }) => (
              <Input id="p-cpf" inputMode="numeric" placeholder="000.000.000-00" aria-invalid={!!errors.cpf} value={field.value} onChange={(e) => field.onChange(maskCpf(e.target.value))} />
            )}
          />
        </Field>
        <Field label="Data de nascimento" htmlFor="p-birth" error={errors.birthDate?.message}>
          <Input id="p-birth" type="date" aria-invalid={!!errors.birthDate} {...register("birthDate")} />
        </Field>
        <Field label="Gênero" htmlFor="p-gender">
          <Select id="p-gender" {...register("gender")}>
            <option value="">Não informado</option>
            <option value="feminino">Feminino</option>
            <option value="masculino">Masculino</option>
            <option value="outro">Outro</option>
          </Select>
        </Field>
        <Field label="Profissão" htmlFor="p-occ">
          <Input id="p-occ" {...register("occupation")} />
        </Field>
        <Field label="Endereço" htmlFor="p-address" className="sm:col-span-2">
          <Input id="p-address" {...register("address")} />
        </Field>
        <Field label="Profissional responsável" htmlFor="p-prof">
          <Select id="p-prof" {...register("responsibleProfessionalId")}>
            <option value="">Não definido</option>
            {professionals.map((p) => (
              <option key={p.id} value={p.id}>
                {professionalDisplayName(p)}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Status" htmlFor="p-status">
            <Select id="p-status" {...register("status")}>
              {Object.entries(PATIENT_STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Origem" htmlFor="p-origin">
            <Select id="p-origin" {...register("origin")}>
              {LEAD_SOURCES.map((s) => (
                <option key={s} value={s}>
                  {LEAD_SOURCE_LABELS[s]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Observações importantes" htmlFor="p-notes" error={errors.importantNotes?.message} hint="Visível no topo do perfil do paciente." className="sm:col-span-2">
          <Textarea id="p-notes" rows={2} {...register("importantNotes")} />
        </Field>
      </form>
    </Dialog>
  );
}
