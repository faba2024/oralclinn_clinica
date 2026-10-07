"use client";

import { useEffect, useState } from "react";
import { ImageUpload } from "@/components/shared/image-upload";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox, Switch } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { useLookups } from "@/hooks/use-lookups";
import { toast } from "@/stores/toast-store";
import { todayISO } from "@/utils/dates";
import { beforeAfterService } from "../service";
import type { BeforeAfterCase } from "../types";

type Draft = Omit<BeforeAfterCase, "id" | "createdAt" | "updatedAt">;

const EMPTY: Draft = {
  title: "",
  patientId: null,
  patientLabel: "Paciente",
  treatmentId: "",
  professionalId: "",
  beforeImage: "",
  afterImage: "",
  date: todayISO(),
  description: "",
  published: false,
  consentConfirmed: false,
};

export function CaseFormDialog({ open, onClose, item }: { open: boolean; onClose: () => void; item?: BeforeAfterCase | null }) {
  const lookups = useLookups();
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (item) {
      const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = item;
      setDraft(rest);
    } else setDraft({ ...EMPTY, date: todayISO() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item?.id]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const save = async () => {
    const e: Record<string, string> = {};
    if (draft.title.trim().length < 3) e.title = "Informe um título";
    if (!draft.treatmentId) e.treatmentId = "Selecione o tratamento";
    if (!draft.beforeImage) e.beforeImage = "Envie a foto do antes";
    if (!draft.afterImage) e.afterImage = "Envie a foto do depois";
    if (draft.published && !draft.consentConfirmed) e.consent = "A publicação exige autorização de uso de imagem";
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    try {
      if (item) await beforeAfterService.update(item.id, draft);
      else await beforeAfterService.create(draft);
      toast.success(item ? "Caso atualizado" : "Caso cadastrado", draft.published ? "Publicado no site" : "Salvo como rascunho");
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="xl"
      title={item ? "Editar caso" : "Novo caso de antes e depois"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={save} loading={saving}>
            Salvar caso
          </Button>
        </>
      }
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Antes" error={errors.beforeImage}>
            <ImageUpload value={draft.beforeImage || null} onChange={(v) => set("beforeImage", v ?? "")} label="Foto do antes" aspect="aspect-square" hint="JPG ou PNG" />
          </Field>
          <Field label="Depois" error={errors.afterImage}>
            <ImageUpload value={draft.afterImage || null} onChange={(v) => set("afterImage", v ?? "")} label="Foto do depois" aspect="aspect-square" hint="Mesmo enquadramento" />
          </Field>
          <p className="col-span-2 text-[12px] leading-relaxed text-subtle">Use o mesmo enquadramento e iluminação nas duas fotos para uma comparação fiel.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Título" htmlFor="ba-title" error={errors.title} required className="sm:col-span-2">
            <Input id="ba-title" value={draft.title} onChange={(e) => set("title", e.target.value)} placeholder="Ex.: Facetas — harmonia de cor e forma" />
          </Field>
          <Field label="Tratamento" htmlFor="ba-trt" error={errors.treatmentId} required>
            <Select id="ba-trt" value={draft.treatmentId} onChange={(e) => set("treatmentId", e.target.value)}>
              <option value="">Selecione</option>
              {lookups.treatments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Profissional" htmlFor="ba-prof">
            <Select id="ba-prof" value={draft.professionalId} onChange={(e) => set("professionalId", e.target.value)}>
              <option value="">Selecione</option>
              {lookups.professionals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} {p.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Paciente (opcional)" htmlFor="ba-patient" hint="Vincula as fotos ao perfil. Não é exibido no site.">
            <Combobox
              id="ba-patient"
              value={draft.patientId}
              onChange={(v) => set("patientId", v)}
              placeholder="Caso anônimo"
              options={lookups.patients.map((p) => ({ value: p.id, label: p.name, leading: <Avatar name={p.name} size="xs" /> }))}
            />
          </Field>
          <Field label="Identificação no site" htmlFor="ba-label" hint="Ex.: Paciente, 34 anos">
            <Input id="ba-label" value={draft.patientLabel} onChange={(e) => set("patientLabel", e.target.value)} />
          </Field>
          <Field label="Data" htmlFor="ba-date">
            <Input id="ba-date" type="date" value={draft.date} onChange={(e) => set("date", e.target.value)} />
          </Field>
          <Field label="Descrição" htmlFor="ba-desc" className="sm:col-span-2">
            <Textarea id="ba-desc" rows={2} value={draft.description} onChange={(e) => set("description", e.target.value)} />
          </Field>
          <div className="space-y-3 rounded-[12px] border border-line p-3 sm:col-span-2">
            <Checkbox
              checked={draft.consentConfirmed}
              onChange={(v) => set("consentConfirmed", v)}
              label="Autorização de uso de imagem assinada"
              description="Termo arquivado nos documentos do paciente."
            />
            {errors.consent ? <p className="text-xs text-danger">{errors.consent}</p> : null}
            <div className="h-px bg-line" />
            <Switch checked={draft.published} onChange={(v) => set("published", v)} label="Publicar no site" description="Exibido na galeria de antes e depois." />
          </div>
        </div>
      </div>
    </Dialog>
  );
}
