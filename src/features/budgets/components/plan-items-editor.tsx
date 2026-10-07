"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { useLookups } from "@/hooks/use-lookups";
import { formatCurrency } from "@/utils/format";
import { emptyItem, itemTotal } from "../service";
import type { PlanItem } from "../types";

interface Props {
  items: PlanItem[];
  onChange: (items: PlanItem[]) => void;
}

export function PlanItemsEditor({ items, onChange }: Props) {
  const lookups = useLookups();
  const update = (id: string, patch: Partial<PlanItem>) => onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const num = (v: string) => (v === "" ? 0 : Math.max(0, Number(v)));

  return (
    <div>
      <ul className="divide-y divide-line border-y border-line">
        {items.map((item, index) => (
          <li key={item.id} className="py-3.5">
            <div className="flex items-center gap-2">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sand text-[11px] font-semibold tabular text-muted">{index + 1}</span>
              <div className="grid flex-1 gap-2 sm:grid-cols-[200px_1fr]">
                <Select
                  aria-label={`Tratamento do item ${index + 1}`}
                  value={item.treatmentId ?? ""}
                  onChange={(e) => {
                    const t = lookups.treatment(e.target.value);
                    update(item.id, {
                      treatmentId: e.target.value || null,
                      procedure: t ? t.name : item.procedure,
                      unitPrice: t ? t.priceFrom : item.unitPrice,
                    });
                  }}
                >
                  <option value="">Item personalizado</option>
                  {lookups.treatments.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Select>
                <Input aria-label={`Procedimento do item ${index + 1}`} placeholder="Descrição do procedimento" value={item.procedure} onChange={(e) => update(item.id, { procedure: e.target.value })} />
              </div>
              <button
                type="button"
                onClick={() => onChange(items.filter((i) => i.id !== item.id))}
                disabled={items.length === 1}
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-subtle transition-colors hover:bg-danger-soft hover:text-danger disabled:opacity-30"
                aria-label={`Remover item ${index + 1}`}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 pl-8 pr-10 sm:grid-cols-[1fr_72px_120px_110px_auto] sm:items-end">
              <label className="text-[11px] font-medium text-subtle">
                Dente / região
                <Input className="mt-1" placeholder="Ex.: 11, 21" value={item.region} onChange={(e) => update(item.id, { region: e.target.value })} />
              </label>
              <label className="text-[11px] font-medium text-subtle">
                Qtd.
                <Input className="mt-1 text-right" type="number" min={1} value={item.quantity} onChange={(e) => update(item.id, { quantity: Math.max(1, num(e.target.value)) })} />
              </label>
              <label className="text-[11px] font-medium text-subtle">
                Valor unit. (R$)
                <Input className="mt-1 text-right" type="number" min={0} step={10} value={item.unitPrice} onChange={(e) => update(item.id, { unitPrice: num(e.target.value) })} />
              </label>
              <label className="text-[11px] font-medium text-subtle">
                Desconto (R$)
                <Input className="mt-1 text-right" type="number" min={0} step={10} value={item.discount} onChange={(e) => update(item.id, { discount: num(e.target.value) })} />
              </label>
              <p className="col-span-2 flex h-9 items-center justify-end text-[14px] font-semibold tabular sm:col-span-1 sm:min-w-28">{formatCurrency(itemTotal(item))}</p>
            </div>
          </li>
        ))}
      </ul>
      <Button variant="ghost" size="sm" className="mt-3" onClick={() => onChange([...items, emptyItem()])}>
        <Plus /> Adicionar procedimento
      </Button>
    </div>
  );
}
