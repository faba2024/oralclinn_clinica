"use client";

import { Copy, Eye, FileX2, MoreHorizontal, PenLine, Printer, Receipt, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { WhatsappIcon } from "@/components/shared/social-icons";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Segmented } from "@/components/ui/tabs";
import { useSiteContentQuery } from "@/features/content/hooks";
import { useReceivables } from "@/features/finance/hooks";
import { useSettings } from "@/features/settings/hooks";
import { useLookups } from "@/hooks/use-lookups";
import { toast } from "@/stores/toast-store";
import { firstName, formatCurrency } from "@/utils/format";
import { fillTemplate, whatsappLink } from "@/utils/whatsapp";
import { usePlan } from "../hooks";
import { budgetService, planTotals } from "../service";
import { PLAN_STATUS, PLAN_STATUSES, type PlanStatus, type TreatmentPlan } from "../types";
import { BudgetDocument } from "./budget-document";
import { GenerateReceivableDialog } from "./generate-receivable-dialog";
import { PlanItemsEditor } from "./plan-items-editor";
import { PlanStatusBadge } from "./plan-status-badge";

type Draft = Pick<TreatmentPlan, "title" | "items" | "globalDiscount" | "status" | "paymentTerms" | "validUntil" | "notes" | "professionalId">;

export function BudgetEditorView({ id }: { id: string }) {
  const router = useRouter();
  const lookups = useLookups();
  const { data: plan, loading } = usePlan(id);
  const { data: settings } = useSettings();
  const { data: content } = useSiteContentQuery();
  const { data: receivables = [] } = useReceivables();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [mode, setMode] = useState<"editar" | "visualizar">("editar");
  const [saving, setSaving] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (plan && !draft) {
      setDraft({
        title: plan.title,
        items: plan.items,
        globalDiscount: plan.globalDiscount,
        status: plan.status,
        paymentTerms: plan.paymentTerms,
        validUntil: plan.validUntil,
        notes: plan.notes,
        professionalId: plan.professionalId,
      });
    }
  }, [plan, draft]);

  const merged = useMemo(() => (plan && draft ? { ...plan, ...draft } : null), [plan, draft]);
  const dirty = useMemo(() => {
    if (!plan || !draft) return false;
    return (Object.keys(draft) as (keyof Draft)[]).some((k) => JSON.stringify(draft[k]) !== JSON.stringify(plan[k]));
  }, [plan, draft]);

  if (loading && plan === undefined) return <Skeleton className="h-[600px] w-full" />;
  if (!plan || !merged || !draft) {
    return (
      <EmptyState
        icon={<FileX2 />}
        title="Orçamento não encontrado"
        action={<Link href="/admin/orcamentos" className={buttonVariants({ variant: "secondary" })}>Voltar aos orçamentos</Link>}
      />
    );
  }

  const patient = lookups.patient(plan.patientId);
  const professional = lookups.professional(draft.professionalId);
  const totals = planTotals(merged);
  const hasReceivable = receivables.some((r) => r.planId === plan.id);

  const save = async (patch?: Partial<Draft>) => {
    const next = { ...draft, ...patch, items: draft.items.filter((i) => i.procedure.trim() || draft.items.length === 1) };
    setSaving(true);
    try {
      await budgetService.save(plan.id, next);
      setDraft(next);
      toast.success("Orçamento salvo", plan.code);
    } finally {
      setSaving(false);
    }
  };

  const sendWhatsapp = async () => {
    if (!patient) return;
    const template = settings?.whatsapp.templates.find((t) => t.key === "orcamento")?.body ?? "";
    const msg = `${fillTemplate(template, { nome: firstName(patient.name) })}\n\n${plan.code} — ${draft.title}\nTotal: ${formatCurrency(totals.total)}\nCondições: ${draft.paymentTerms}`;
    if (draft.status === "rascunho") await save({ status: "enviado" });
    window.open(whatsappLink(patient.phone, msg), "_blank", "noopener");
  };

  const print = () => {
    setMode("visualizar");
    setTimeout(() => window.print(), 150);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        breadcrumb={[{ label: "Orçamentos", href: "/admin/orcamentos" }, { label: plan.code }]}
        title={
          <span className="flex flex-wrap items-center gap-3">
            {draft.title}
            <PlanStatusBadge status={draft.status} />
          </span>
        }
        description={
          patient ? (
            <>
              Paciente:{" "}
              <Link href={`/admin/pacientes/${patient.id}`} className="font-medium text-ink hover:text-gold-dark">
                {patient.name}
              </Link>
            </>
          ) : undefined
        }
        actions={
          <>
            <Segmented
              label="Modo"
              value={mode}
              onChange={setMode}
              options={[
                { value: "editar", label: "Editar" },
                { value: "visualizar", label: "Documento" },
              ]}
            />
            <Button variant="secondary" onClick={print}>
              <Printer /> Imprimir
            </Button>
            <Button variant="secondary" onClick={sendWhatsapp} disabled={!patient}>
              <WhatsappIcon className="size-4 text-[#25D366]" /> Enviar
            </Button>
            <Button onClick={() => save()} loading={saving} disabled={!dirty}>
              <Save /> {dirty ? "Salvar" : "Salvo"}
            </Button>
            <DropdownMenu
              trigger={<span className="flex size-9 items-center justify-center rounded-[10px] border border-line bg-white"><MoreHorizontal className="size-4" /></span>}
              items={[
                { label: "Gerar lançamento financeiro", icon: <Receipt />, onSelect: () => setGenerateOpen(true), disabled: hasReceivable },
                {
                  label: "Duplicar",
                  icon: <Copy />,
                  onSelect: async () => {
                    const copy = await budgetService.duplicate(plan.id);
                    if (copy) {
                      toast.success("Orçamento duplicado", copy.code);
                      router.push(`/admin/orcamentos/${copy.id}`);
                    }
                  },
                },
                { label: "Excluir", icon: <Trash2 />, danger: true, separatorBefore: true, onSelect: () => setConfirmDelete(true) },
              ]}
            />
          </>
        }
      />

      {mode === "visualizar" ? (
        <Card className="overflow-hidden bg-sand/40 p-2 sm:p-8">
          <BudgetDocument plan={merged} patient={patient} professional={professional} settings={settings} content={content} className="rounded-[6px] shadow-[var(--shadow-card)]" />
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <Card>
              <CardBody className="grid gap-4 sm:grid-cols-2">
                <Field label="Título do plano" htmlFor="b-title" className="sm:col-span-2">
                  <Input id="b-title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
                </Field>
                <Field label="Profissional responsável" htmlFor="b-prof">
                  <Select id="b-prof" value={draft.professionalId} onChange={(e) => setDraft({ ...draft, professionalId: e.target.value })}>
                    {lookups.professionals.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} {p.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Status" htmlFor="b-status">
                  <Select id="b-status" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as PlanStatus })}>
                    {PLAN_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {PLAN_STATUS[s].label}
                      </option>
                    ))}
                  </Select>
                </Field>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Procedimentos" description="Selecione do catálogo ou descreva um item personalizado." />
              <CardBody className="pt-4">
                <PlanItemsEditor items={draft.items} onChange={(items) => setDraft({ ...draft, items })} />
              </CardBody>
            </Card>

            <Card>
              <CardBody className="grid gap-4 sm:grid-cols-2">
                <Field label="Formas de pagamento" htmlFor="b-terms" className="sm:col-span-2">
                  <Textarea id="b-terms" rows={2} value={draft.paymentTerms} onChange={(e) => setDraft({ ...draft, paymentTerms: e.target.value })} />
                </Field>
                <Field label="Validade da proposta" htmlFor="b-valid">
                  <Input id="b-valid" type="date" value={draft.validUntil} onChange={(e) => setDraft({ ...draft, validUntil: e.target.value })} />
                </Field>
                <Field label="Observações" htmlFor="b-notes" className="sm:col-span-2">
                  <Textarea id="b-notes" rows={2} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
                </Field>
              </CardBody>
            </Card>
          </div>

          <div className="xl:sticky xl:top-24 xl:self-start">
            <Card>
              <CardHeader title="Resumo" />
              <CardBody className="pt-4">
                <dl className="space-y-2.5 text-[13.5px]">
                  <div className="flex justify-between">
                    <dt className="text-muted">Subtotal</dt>
                    <dd className="tabular">{formatCurrency(totals.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted">Descontos nos itens</dt>
                    <dd className="tabular text-success">− {formatCurrency(totals.itemDiscounts)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted">
                      <label htmlFor="b-disc">Desconto geral</label>
                    </dt>
                    <dd className="w-28">
                      <Input
                        id="b-disc"
                        type="number"
                        min={0}
                        step={50}
                        className="h-8 text-right"
                        value={draft.globalDiscount}
                        onChange={(e) => setDraft({ ...draft, globalDiscount: Math.max(0, Number(e.target.value) || 0) })}
                      />
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between border-t border-line pt-3">
                    <dt className="font-semibold">Total</dt>
                    <dd className="text-2xl font-semibold tracking-[-0.02em] tabular">{formatCurrency(totals.total)}</dd>
                  </div>
                </dl>
                <div className="mt-5 space-y-2">
                  <Button className="w-full" variant="secondary" onClick={() => setMode("visualizar")}>
                    <Eye /> Ver documento
                  </Button>
                  {hasReceivable ? (
                    <p className="rounded-[10px] bg-success-soft px-3 py-2 text-center text-[12.5px] text-success">Lançamento financeiro já gerado</p>
                  ) : (
                    <Button className="w-full" variant="gold" onClick={() => setGenerateOpen(true)} disabled={totals.total <= 0 || dirty}>
                      <Receipt /> Aprovar e gerar parcelas
                    </Button>
                  )}
                  {dirty ? (
                    <p className="flex items-center justify-center gap-1.5 text-[12px] text-warning">
                      <PenLine className="size-3.5" /> Alterações não salvas
                    </p>
                  ) : null}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      <GenerateReceivableDialog
        open={generateOpen}
        onClose={() => {
          setGenerateOpen(false);
          setDraft(null);
        }}
        planId={plan.id}
        total={totals.total}
        maxInstallments={settings?.finance.maxInstallments ?? 12}
      />
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Excluir orçamento?"
        description={`${plan.code} será removido. Lançamentos financeiros já gerados não são afetados.`}
        onConfirm={async () => {
          await budgetService.remove(plan.id);
          toast.success("Orçamento excluído");
          router.replace("/admin/orcamentos");
        }}
      />
    </div>
  );
}
