"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select } from "@/components/ui/input";
import { toast } from "@/stores/toast-store";
import type { PaymentMethod } from "@/types/common";
import { PAYMENT_METHOD_LABELS, PAYMENT_METHODS } from "@/types/labels";
import { todayISO } from "@/utils/dates";
import { formatCurrency } from "@/utils/format";
import { budgetService } from "../service";

interface Props {
  open: boolean;
  onClose: () => void;
  planId: string;
  total: number;
  maxInstallments: number;
}

export function GenerateReceivableDialog({ open, onClose, planId, total, maxInstallments }: Props) {
  const [installments, setInstallments] = useState(1);
  const [method, setMethod] = useState<PaymentMethod>("credito");
  const [firstDue, setFirstDue] = useState(todayISO());
  const [firstPaid, setFirstPaid] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setInstallments(1);
      setFirstDue(todayISO());
      setFirstPaid(false);
    }
  }, [open]);

  const submit = async () => {
    setSaving(true);
    try {
      await budgetService.generateReceivable(planId, installments, method, firstDue, firstPaid);
      toast.success("Lançamento financeiro criado", `${installments}x de ${formatCurrency(total / installments)}`);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="sm"
      title="Gerar lançamento financeiro"
      description={`Total do plano: ${formatCurrency(total)}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit} loading={saving} disabled={total <= 0}>
            Gerar parcelas
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Parcelas" htmlFor="g-inst">
            <Select id="g-inst" value={installments} onChange={(e) => setInstallments(Number(e.target.value))}>
              {Array.from({ length: maxInstallments }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}x de {formatCurrency(total / n)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Forma" htmlFor="g-method">
            <Select id="g-method" value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {PAYMENT_METHOD_LABELS[m]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Primeiro vencimento" htmlFor="g-due">
          <Input id="g-due" type="date" value={firstDue} onChange={(e) => setFirstDue(e.target.value)} />
        </Field>
        <Checkbox checked={firstPaid} onChange={setFirstPaid} label="Primeira parcela (entrada) já recebida" />
        <p className="text-[12px] leading-relaxed text-subtle">O plano será marcado como aprovado e as parcelas aparecerão no Financeiro e no perfil do paciente.</p>
      </div>
    </Dialog>
  );
}
