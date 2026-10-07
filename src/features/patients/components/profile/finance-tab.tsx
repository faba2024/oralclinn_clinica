"use client";

import { Check, Plus, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { InstallmentStatusBadge } from "@/features/finance/components/installment-status-badge";
import { ReceivableFormDialog } from "@/features/finance/components/receivable-form-dialog";
import { usePatientReceivables } from "@/features/finance/hooks";
import { financeService, installmentStatus, receivablePaid, receivableTotal } from "@/features/finance/service";
import { toast } from "@/stores/toast-store";
import { PAYMENT_METHOD_LABELS } from "@/types/labels";
import { formatCurrency, formatDate } from "@/utils/format";

export function FinanceTab({ patientId }: { patientId: string }) {
  const { data = [] } = usePatientReceivables(patientId);
  const [formOpen, setFormOpen] = useState(false);
  const sorted = [...data].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const total = data.reduce((s, r) => s + receivableTotal(r), 0);
  const paid = data.reduce((s, r) => s + receivablePaid(r), 0);

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="grid flex-1 grid-cols-3 gap-4">
            <div>
              <p className="text-[12px] text-muted">Total contratado</p>
              <p className="mt-1 text-lg font-semibold tabular">{formatCurrency(total)}</p>
            </div>
            <div>
              <p className="text-[12px] text-muted">Recebido</p>
              <p className="mt-1 text-lg font-semibold tabular text-success">{formatCurrency(paid)}</p>
            </div>
            <div>
              <p className="text-[12px] text-muted">Em aberto</p>
              <p className="mt-1 text-lg font-semibold tabular">{formatCurrency(total - paid)}</p>
            </div>
          </div>
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus /> Nova receita
          </Button>
        </div>
        <Progress className="mt-4" value={total ? paid / total : 0} tone="success" />
      </Card>

      {sorted.length === 0 ? (
        <Card>
          <EmptyState title="Nenhum lançamento financeiro" description="Lance receitas ou gere a partir de um plano aprovado." />
        </Card>
      ) : (
        sorted.map((r) => (
          <Card key={r.id} className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
              <div>
                <p className="text-[14px] font-semibold">{r.description}</p>
                <p className="text-[12px] text-subtle">
                  {PAYMENT_METHOD_LABELS[r.method]} · {r.installments.length}x · lançado em {formatDate(r.createdAt)}
                </p>
              </div>
              <p className="text-[14px] font-semibold tabular">{formatCurrency(receivableTotal(r))}</p>
            </div>
            <ul className="divide-y divide-line/70">
              {r.installments.map((i) => {
                const status = installmentStatus(i);
                return (
                  <li key={i.id} className="flex flex-wrap items-center gap-3 px-4 py-2.5 text-[13px]">
                    <span className="w-12 font-medium tabular text-muted">
                      {i.number}/{r.installments.length}
                    </span>
                    <span className="w-24 tabular">{formatDate(i.dueDate)}</span>
                    <span className="w-28 font-medium tabular">{formatCurrency(i.amount)}</span>
                    <InstallmentStatusBadge status={status} />
                    {i.paidAt ? <span className="text-[12px] text-subtle">pago em {formatDate(i.paidAt)}</span> : null}
                    <span className="ml-auto">
                      {i.paidAt ? (
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={async () => {
                            await financeService.setInstallmentPaid(r.id, i.id, false);
                            toast.info("Baixa desfeita");
                          }}
                        >
                          <RotateCcw /> Desfazer
                        </Button>
                      ) : (
                        <Button
                          size="xs"
                          variant="secondary"
                          onClick={async () => {
                            await financeService.setInstallmentPaid(r.id, i.id, true);
                            toast.success("Pagamento registrado", formatCurrency(i.amount));
                          }}
                        >
                          <Check /> Dar baixa
                        </Button>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Card>
        ))
      )}
      <ReceivableFormDialog open={formOpen} onClose={() => setFormOpen(false)} patientId={patientId} />
    </div>
  );
}
