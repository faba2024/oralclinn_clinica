"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { useLookups } from "@/hooks/use-lookups";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "@/stores/toast-store";
import { todayISO } from "@/utils/dates";
import { formatDate } from "@/utils/format";
import { recordService } from "../service";
import type { Evolution } from "../types";

type Draft = Omit<Evolution, "id"> & { id?: string };

export function EvolutionTimeline({ patientId, evolutions }: { patientId: string; evolutions: Evolution[] }) {
  const lookups = useLookups();
  const user = useAuthStore((s) => s.user);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [toDelete, setToDelete] = useState<Evolution | null>(null);
  const [saving, setSaving] = useState(false);
  const sorted = [...evolutions].sort((a, b) => b.date.localeCompare(a.date));

  const startNew = () =>
    setDraft({ date: todayISO(), professionalId: user?.professionalId ?? lookups.professionals[0]?.id ?? "", procedure: "", teeth: "", description: "" });

  const save = async () => {
    if (!draft) return;
    if (!draft.procedure.trim() || !draft.description.trim()) {
      toast.error("Preencha procedimento e descrição");
      return;
    }
    setSaving(true);
    try {
      if (draft.id) await recordService.updateEvolution(patientId, draft as Evolution);
      else await recordService.addEvolution(patientId, draft);
      toast.success(draft.id ? "Evolução atualizada" : "Evolução registrada");
      setDraft(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[14px] font-semibold">Evolução clínica</h3>
        <Button size="sm" onClick={startNew}>
          <Plus /> Nova evolução
        </Button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState compact title="Nenhuma evolução registrada" description="Registre cada atendimento para manter o histórico clínico completo." />
      ) : (
        <ol className="relative ml-2 border-l border-line">
          {sorted.map((e) => {
            const prof = lookups.professional(e.professionalId);
            return (
              <li key={e.id} className="group relative pb-6 pl-6 last:pb-0">
                <span className="absolute -left-[5px] top-1.5 size-2.5 rounded-full border-2 border-white ring-1 ring-line" style={{ backgroundColor: prof?.color ?? "#B69A67" }} />
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-[13.5px] font-semibold text-ink">
                    {e.procedure}
                    {e.teeth && e.teeth !== "—" ? <span className="ml-2 text-[12px] font-normal text-subtle">Dentes {e.teeth}</span> : null}
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="text-[12px] tabular text-subtle">{formatDate(e.date)}</span>
                    <span className="flex opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                      <button type="button" onClick={() => setDraft(e)} className="rounded-md p-1 text-subtle hover:bg-sand hover:text-ink" aria-label="Editar evolução">
                        <Pencil className="size-3.5" />
                      </button>
                      <button type="button" onClick={() => setToDelete(e)} className="rounded-md p-1 text-subtle hover:bg-danger-soft hover:text-danger" aria-label="Excluir evolução">
                        <Trash2 className="size-3.5" />
                      </button>
                    </span>
                  </div>
                </div>
                <p className="text-[12px] text-muted">{prof ? `${prof.title} ${prof.name}` : "—"}</p>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-2">{e.description}</p>
              </li>
            );
          })}
        </ol>
      )}

      <Dialog
        open={!!draft}
        onClose={() => setDraft(null)}
        title={draft?.id ? "Editar evolução" : "Nova evolução"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDraft(null)}>
              Cancelar
            </Button>
            <Button onClick={save} loading={saving}>
              Salvar evolução
            </Button>
          </>
        }
      >
        {draft ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Data" htmlFor="ev-date">
              <Input id="ev-date" type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
            </Field>
            <Field label="Profissional" htmlFor="ev-prof">
              <Select id="ev-prof" value={draft.professionalId} onChange={(e) => setDraft({ ...draft, professionalId: e.target.value })}>
                {lookups.professionals.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} {p.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Procedimento" htmlFor="ev-proc" required>
              <Input id="ev-proc" value={draft.procedure} onChange={(e) => setDraft({ ...draft, procedure: e.target.value })} placeholder="Ex.: Restauração em resina" />
            </Field>
            <Field label="Dente / região" htmlFor="ev-teeth">
              <Input id="ev-teeth" value={draft.teeth} onChange={(e) => setDraft({ ...draft, teeth: e.target.value })} placeholder="Ex.: 16, 26" />
            </Field>
            <Field label="Descrição" htmlFor="ev-desc" required className="sm:col-span-2">
              <Textarea id="ev-desc" rows={4} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            </Field>
          </div>
        ) : null}
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Excluir evolução?"
        description="Este registro será removido do prontuário do paciente."
        onConfirm={async () => {
          if (toDelete) await recordService.removeEvolution(patientId, toDelete.id);
          toast.success("Evolução excluída");
        }}
      />
    </div>
  );
}
