"use client";

import { FilePlus2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { usePatientPlans } from "@/features/budgets/hooks";
import { budgetService, planTotals } from "@/features/budgets/service";
import { PLAN_STATUS } from "@/features/budgets/types";
import { useLookups } from "@/hooks/use-lookups";
import { useAuthStore } from "@/stores/auth-store";
import { formatCurrency, formatDate } from "@/utils/format";
import type { Patient } from "../../types";

export function PlansTab({ patient }: { patient: Patient }) {
  const router = useRouter();
  const lookups = useLookups();
  const user = useAuthStore((s) => s.user);
  const { data: plans = [] } = usePatientPlans(patient.id);
  const [creating, setCreating] = useState(false);

  const create = async () => {
    setCreating(true);
    try {
      const plan = await budgetService.createDraft(patient.id, user?.professionalId ?? patient.responsibleProfessionalId ?? lookups.professionals[0]?.id ?? "");
      router.push(`/admin/orcamentos/${plan.id}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-line p-4">
        <p className="text-[14px] font-semibold">Planos de tratamento</p>
        <Button size="sm" onClick={create} loading={creating}>
          <FilePlus2 /> Novo plano
        </Button>
      </div>
      {plans.length === 0 ? (
        <EmptyState title="Nenhum plano de tratamento" description="Monte o plano com procedimentos, regiões e valores para gerar o orçamento." />
      ) : (
        <ul className="divide-y divide-line">
          {[...plans]
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .map((p) => {
              const t = planTotals(p);
              return (
                <li key={p.id}>
                  <Link href={`/admin/orcamentos/${p.id}`} className="flex flex-col gap-2 p-4 transition-colors hover:bg-ivory sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-semibold tabular text-gold-dark">{p.code}</span>
                        <Badge tone={PLAN_STATUS[p.status].tone}>{PLAN_STATUS[p.status].label}</Badge>
                      </div>
                      <p className="mt-1 truncate text-[14px] font-medium">{p.title}</p>
                      <p className="text-[12px] text-subtle">
                        {p.items.length} procedimento{p.items.length === 1 ? "" : "s"} · {lookups.professionalName(p.professionalId)} · criado em {formatDate(p.createdAt)}
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-[15px] font-semibold tabular">{formatCurrency(t.total)}</p>
                      {t.discount ? <p className="text-[12px] tabular text-subtle">desconto de {formatCurrency(t.discount)}</p> : null}
                    </div>
                  </Link>
                </li>
              );
            })}
        </ul>
      )}
    </Card>
  );
}
