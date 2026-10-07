"use client";

import { Pencil, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/input";
import { toast } from "@/stores/toast-store";
import { recordService } from "../service";
import type { ClinicalRecord } from "../types";

type Fields = Pick<ClinicalRecord, "chiefComplaint" | "medicalHistory" | "allergies" | "medications" | "conditions" | "clinicalNotes" | "therapeuticPlan">;

const FIELDS: { key: keyof Fields; label: string; placeholder: string; wide?: boolean }[] = [
  { key: "chiefComplaint", label: "Queixa principal", placeholder: "Motivo da consulta nas palavras do paciente", wide: true },
  { key: "medicalHistory", label: "Histórico médico", placeholder: "Doenças, cirurgias, internações" },
  { key: "allergies", label: "Alergias", placeholder: "Medicamentos, materiais, alimentos" },
  { key: "medications", label: "Medicamentos em uso", placeholder: "Nome e posologia" },
  { key: "conditions", label: "Condições relevantes", placeholder: "Gestação, hipertensão, diabetes, anticoagulantes…" },
  { key: "clinicalNotes", label: "Observações clínicas", placeholder: "Achados do exame clínico", wide: true },
  { key: "therapeuticPlan", label: "Plano terapêutico", placeholder: "Plano definido pelo profissional responsável", wide: true },
];

const EMPTY: Fields = { chiefComplaint: "", medicalHistory: "", allergies: "", medications: "", conditions: "", clinicalNotes: "", therapeuticPlan: "" };

export function AnamnesisForm({ patientId, record }: { patientId: string; record: ClinicalRecord | null }) {
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState<Fields>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) setValues(record ? { ...EMPTY, ...pick(record) } : EMPTY);
  }, [record, editing]);

  const save = async () => {
    setSaving(true);
    try {
      await recordService.saveAnamnesis(patientId, values);
      toast.success("Prontuário atualizado");
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const alerts = [record?.allergies, record?.conditions].filter((v) => v && !/^(nenhuma|—|-)/i.test(v.trim()));

  return (
    <div>
      {alerts.length && !editing ? (
        <div className="mb-4 flex items-start gap-2.5 rounded-[10px] border border-danger/20 bg-danger-soft px-3.5 py-3 text-[13px] text-danger">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-semibold">Atenção clínica</p>
            {alerts.map((a) => (
              <p key={a}>{a}</p>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[14px] font-semibold">Anamnese</h3>
        {editing ? (
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setEditing(false)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={save} loading={saving}>
              Salvar
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
            <Pencil /> Editar
          </Button>
        )}
      </div>

      {editing ? (
        <div className="grid gap-4 md:grid-cols-2">
          {FIELDS.map((f) => (
            <Field key={f.key} label={f.label} htmlFor={`an-${f.key}`} className={f.wide ? "md:col-span-2" : undefined}>
              <Textarea
                id={`an-${f.key}`}
                rows={2}
                placeholder={f.placeholder}
                value={values[f.key]}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              />
            </Field>
          ))}
        </div>
      ) : (
        <dl className="grid gap-x-6 gap-y-4 md:grid-cols-2">
          {FIELDS.map((f) => (
            <div key={f.key} className={f.wide ? "md:col-span-2" : undefined}>
              <dt className="text-[11.5px] font-medium uppercase tracking-[0.08em] text-subtle">{f.label}</dt>
              <dd className="mt-1 text-[13.5px] leading-relaxed text-ink">{record?.[f.key] || <span className="text-subtle">Não informado</span>}</dd>
            </div>
          ))}
        </dl>
      )}
      <p className="mt-5 text-[11.5px] text-subtle">
        O prontuário registra exclusivamente as informações inseridas pelos profissionais. O sistema não realiza diagnósticos nem sugere condutas.
      </p>
    </div>
  );
}

function pick(r: ClinicalRecord): Fields {
  return {
    chiefComplaint: r.chiefComplaint,
    medicalHistory: r.medicalHistory,
    allergies: r.allergies,
    medications: r.medications,
    conditions: r.conditions,
    clinicalNotes: r.clinicalNotes,
    therapeuticPlan: r.therapeuticPlan,
  };
}
