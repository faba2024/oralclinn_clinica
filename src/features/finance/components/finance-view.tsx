"use client";

import { AlertTriangle, ArrowDownRight, ArrowUpRight, Check, CircleDollarSign, Clock, Pencil, Plus, Receipt, RotateCcw, Trash2, TrendingUp, Wallet } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { DonutChart, Legend } from "@/components/charts/donut-chart";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { PageHeader } from "@/components/shared/page-header";
import { PeriodFilter } from "@/components/shared/period-filter";
import { StatCard } from "@/components/shared/stat-card";
import { WhatsappIcon } from "@/components/shared/social-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable, type Column } from "@/components/ui/data-table";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Segmented, Tabs } from "@/components/ui/tabs";
import { rangeForPreset } from "@/features/reports/period";
import { useLookups } from "@/hooks/use-lookups";
import { toast } from "@/stores/toast-store";
import type { DateRange, PeriodPreset } from "@/types/common";
import { PAYMENT_METHOD_LABELS } from "@/types/labels";
import { formatCurrency, formatDate, firstName } from "@/utils/format";
import { whatsappLink } from "@/utils/whatsapp";
import { useExpenses, useReceivables } from "../hooks";
import { financeService, flattenInstallments, monthlySeries, receivablePaid, receivableTotal, summarize } from "../service";
import { EXPENSE_CATEGORY_LABELS, type Expense, type InstallmentRow, type InstallmentStatus, type Receivable } from "../types";
import { ExpenseFormDialog } from "./expense-form-dialog";
import { InstallmentStatusBadge } from "./installment-status-badge";
import { ReceivableFormDialog } from "./receivable-form-dialog";

type TabId = "visao" | "receitas" | "despesas" | "pagamentos" | "parcelas";

export function FinanceView() {
  const params = useSearchParams();
  const lookups = useLookups();
  const { data: receivables, loading } = useReceivables();
  const { data: expenses } = useExpenses();
  const [tab, setTab] = useState<TabId>(() => (params.get("aba") as TabId) || "visao");
  const [preset, setPreset] = useState<PeriodPreset>("30d");
  const [custom, setCustom] = useState<DateRange>(() => rangeForPreset("30d"));
  const [receivableOpen, setReceivableOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [toDelete, setToDelete] = useState<{ kind: "receita" | "despesa"; id: string; label: string } | null>(null);
  const [installmentFilter, setInstallmentFilter] = useState<InstallmentStatus | "abertas">("abertas");

  const range = useMemo(() => rangeForPreset(preset, custom), [preset, custom]);
  const rec = useMemo(() => receivables ?? [], [receivables]);
  const exp = useMemo(() => expenses ?? [], [expenses]);
  const summary = useMemo(() => summarize(rec, exp, range), [rec, exp, range]);
  const series = useMemo(() => monthlySeries(rec, exp, 6), [rec, exp]);
  const rows = useMemo(() => flattenInstallments(rec), [rec]);

  const expensesByCategory = useMemo(() => {
    const map = new Map<string, number>();
    exp.filter((e) => e.date >= range.from && e.date <= range.to).forEach((e) => map.set(EXPENSE_CATEGORY_LABELS[e.category], (map.get(EXPENSE_CATEGORY_LABELS[e.category]) ?? 0) + e.amount));
    return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [exp, range.from, range.to]);

  const byMethod = useMemo(() => {
    const map = new Map<string, number>();
    rows.filter((r) => r.paidAt && r.paidAt >= range.from && r.paidAt <= range.to).forEach((r) => map.set(PAYMENT_METHOD_LABELS[r.method], (map.get(PAYMENT_METHOD_LABELS[r.method]) ?? 0) + r.amount));
    return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [rows, range.from, range.to]);

  const payments = useMemo(
    () => rows.filter((r) => r.paidAt && r.paidAt >= range.from && r.paidAt <= range.to),
    [rows, range.from, range.to],
  );
  const filteredInstallments = useMemo(
    () => rows.filter((r) => (installmentFilter === "abertas" ? r.status !== "pago" : r.status === installmentFilter)),
    [rows, installmentFilter],
  );

  const pay = async (r: InstallmentRow, paid: boolean) => {
    await financeService.setInstallmentPaid(r.receivableId, r.id, paid);
    if (paid) toast.success("Pagamento registrado", `${lookups.patientName(r.patientId)} · ${formatCurrency(r.amount)}`);
    else toast.info("Baixa desfeita");
  };

  const chargeLink = (r: InstallmentRow) => {
    const p = lookups.patient(r.patientId);
    if (!p) return "#";
    return whatsappLink(
      p.phone,
      `Olá, ${firstName(p.name)}! Tudo bem? Passando para lembrar da parcela ${r.number}/${r.totalInstallments} de ${formatCurrency(r.amount)} (${r.description}) com vencimento em ${formatDate(r.dueDate)}. Qualquer dúvida, estamos à disposição.`,
    );
  };

  const receivableColumns: Column<Receivable>[] = [
    { key: "date", header: "Lançamento", sortValue: (r) => r.createdAt, cell: (r) => <span className="tabular text-muted">{formatDate(r.createdAt)}</span> },
    { key: "patient", header: "Paciente", sortValue: (r) => lookups.patientName(r.patientId), cell: (r) => <span className="whitespace-nowrap font-medium">{lookups.patientName(r.patientId)}</span> },
    { key: "desc", header: "Descrição", cell: (r) => <span className="block max-w-[220px] truncate text-ink-2">{r.description}</span> },
    { key: "method", header: "Forma", cell: (r) => <span className="text-muted">{PAYMENT_METHOD_LABELS[r.method]} · {r.installments.length}x</span> },
    {
      key: "progress",
      header: "Recebido",
      sortValue: (r) => receivablePaid(r) / receivableTotal(r),
      cell: (r) => (
        <div className="w-28">
          <Progress value={receivablePaid(r) / receivableTotal(r)} tone="success" />
          <p className="mt-1 text-[11px] tabular text-subtle">{formatCurrency(receivablePaid(r))}</p>
        </div>
      ),
    },
    { key: "total", header: "Total", align: "right", sortValue: (r) => receivableTotal(r), cell: (r) => <span className="font-semibold tabular">{formatCurrency(receivableTotal(r))}</span> },
    {
      key: "actions",
      header: "",
      cell: (r) => (
        <DropdownMenu items={[{ label: "Excluir lançamento", icon: <Trash2 />, danger: true, onSelect: () => setToDelete({ kind: "receita", id: r.id, label: r.description }) }]} />
      ),
    },
  ];

  const expenseColumns: Column<Expense>[] = [
    { key: "date", header: "Data", sortValue: (e) => e.date, cell: (e) => <span className="tabular text-muted">{formatDate(e.date)}</span> },
    { key: "cat", header: "Categoria", sortValue: (e) => e.category, cell: (e) => <Badge>{EXPENSE_CATEGORY_LABELS[e.category]}</Badge> },
    { key: "desc", header: "Descrição", cell: (e) => <span className="font-medium">{e.description}</span> },
    { key: "sup", header: "Fornecedor", cell: (e) => <span className="text-muted">{e.supplier || "—"}</span> },
    { key: "method", header: "Forma", cell: (e) => <span className="text-muted">{PAYMENT_METHOD_LABELS[e.method]}</span> },
    { key: "paid", header: "Status", cell: (e) => <Badge tone={e.paid ? "success" : "warning"} dot>{e.paid ? "Pago" : "A pagar"}</Badge> },
    { key: "amount", header: "Valor", align: "right", sortValue: (e) => e.amount, cell: (e) => <span className="font-semibold tabular">{formatCurrency(e.amount)}</span> },
    {
      key: "actions",
      header: "",
      cell: (e) => (
        <DropdownMenu
          items={[
            { label: "Editar", icon: <Pencil />, onSelect: () => { setEditingExpense(e); setExpenseOpen(true); } },
            { label: e.paid ? "Marcar como a pagar" : "Marcar como pago", icon: <Check />, onSelect: () => void financeService.updateExpense(e.id, { paid: !e.paid }) },
            { label: "Excluir", icon: <Trash2 />, danger: true, separatorBefore: true, onSelect: () => setToDelete({ kind: "despesa", id: e.id, label: e.description }) },
          ]}
        />
      ),
    },
  ];

  const installmentColumns: Column<InstallmentRow>[] = [
    { key: "due", header: "Vencimento", sortValue: (r) => r.dueDate, cell: (r) => <span className="whitespace-nowrap tabular font-medium">{formatDate(r.dueDate)}</span> },
    { key: "patient", header: "Paciente", sortValue: (r) => lookups.patientName(r.patientId), cell: (r) => <span className="whitespace-nowrap">{lookups.patientName(r.patientId)}</span> },
    { key: "desc", header: "Descrição", cell: (r) => <span className="block max-w-[200px] truncate text-muted">{r.description}</span> },
    { key: "n", header: "Parcela", cell: (r) => <span className="tabular text-muted">{r.number}/{r.totalInstallments}</span> },
    { key: "status", header: "Status", sortValue: (r) => r.status, cell: (r) => <InstallmentStatusBadge status={r.status} /> },
    { key: "amount", header: "Valor", align: "right", sortValue: (r) => r.amount, cell: (r) => <span className="font-semibold tabular">{formatCurrency(r.amount)}</span> },
    {
      key: "actions",
      header: "",
      cell: (r) => (
        <div className="flex justify-end gap-1">
          {r.paidAt ? (
            <Button size="xs" variant="ghost" onClick={(e) => { e.stopPropagation(); void pay(r, false); }}>
              <RotateCcw /> Desfazer
            </Button>
          ) : (
            <>
              <a href={chargeLink(r)} target="_blank" rel="noreferrer" className="inline-flex h-7 items-center gap-1 rounded-[8px] px-2 text-xs font-medium text-ink-2 hover:bg-sand" aria-label="Enviar lembrete pelo WhatsApp">
                <WhatsappIcon className="size-3.5 text-[#25D366]" /> Cobrar
              </a>
              <Button size="xs" variant="secondary" onClick={(e) => { e.stopPropagation(); void pay(r, true); }}>
                <Check /> Dar baixa
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  const paymentColumns: Column<InstallmentRow>[] = [
    { key: "paid", header: "Data", sortValue: (r) => r.paidAt ?? "", cell: (r) => <span className="tabular">{formatDate(r.paidAt)}</span> },
    { key: "patient", header: "Paciente", cell: (r) => <span className="font-medium">{lookups.patientName(r.patientId)}</span> },
    { key: "desc", header: "Referente a", cell: (r) => <span className="text-muted">{r.description} · {r.number}/{r.totalInstallments}</span> },
    { key: "method", header: "Forma", cell: (r) => <Badge>{PAYMENT_METHOD_LABELS[r.method]}</Badge> },
    { key: "amount", header: "Valor", align: "right", sortValue: (r) => r.amount, cell: (r) => <span className="font-semibold tabular text-success">{formatCurrency(r.amount)}</span> },
  ];

  const tabs = [
    { id: "visao" as const, label: "Visão geral" },
    { id: "receitas" as const, label: "Receitas", count: rec.length },
    { id: "despesas" as const, label: "Despesas", count: exp.filter((e) => e.date >= range.from && e.date <= range.to).length },
    { id: "pagamentos" as const, label: "Pagamentos", count: payments.length },
    { id: "parcelas" as const, label: "Parcelas", count: rows.filter((r) => r.status === "atrasado").length },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Financeiro"
        description="Receitas, despesas, recebimentos e inadimplência."
        actions={
          <>
            <PeriodFilter preset={preset} onPresetChange={setPreset} custom={custom} onCustomChange={setCustom} />
            <Button variant="secondary" onClick={() => { setEditingExpense(null); setExpenseOpen(true); }}>
              <ArrowDownRight /> Despesa
            </Button>
            <Button onClick={() => setReceivableOpen(true)}>
              <Plus /> Receita
            </Button>
          </>
        }
      />

      <section aria-label="Resumo financeiro" className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 min-[1680px]:grid-cols-6">
        <StatCard emphasis label="Receita" icon={<ArrowUpRight />} value={formatCurrency(summary.revenue)} hint="recebida no período" loading={loading} />
        <StatCard label="Despesa" icon={<ArrowDownRight />} value={formatCurrency(summary.expenses)} hint="no período" loading={loading} />
        <StatCard label="Lucro" icon={<TrendingUp />} value={formatCurrency(summary.profit)} hint={summary.revenue ? `margem ${Math.round((summary.profit / summary.revenue) * 100)}%` : undefined} loading={loading} />
        <StatCard label="A receber" icon={<Clock />} value={formatCurrency(summary.receivable)} hint="parcelas em aberto" loading={loading} />
        <StatCard label="Recebido" icon={<CircleDollarSign />} value={formatCurrency(summary.received)} hint="no período" loading={loading} />
        <StatCard label="Atrasado" icon={<AlertTriangle />} value={formatCurrency(summary.overdue)} hint={`${rows.filter((r) => r.status === "atrasado").length} parcelas`} loading={loading} />
      </section>

      <Tabs items={tabs} value={tab} onChange={setTab} label="Seções do financeiro" className="mb-5" />

      {tab === "visao" ? (
        <div className="grid gap-4 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader title="Receitas x despesas" description="Últimos 6 meses" />
            <CardBody className="pt-3">{receivables ? <RevenueChart data={series} height={280} /> : <Skeleton className="h-[280px]" />}</CardBody>
          </Card>
          <div className="grid gap-4">
            <Card>
              <CardHeader title="Despesas por categoria" description="No período selecionado" />
              <CardBody className="grid grid-cols-[120px_1fr] items-center gap-4 pt-3">
                {expensesByCategory.length ? (
                  <>
                    <DonutChart data={expensesByCategory} label="Despesas por categoria" height={120} formatter={formatCurrency} />
                    <Legend items={expensesByCategory.slice(0, 5).map((d) => ({ name: d.name, value: formatCurrency(d.value) }))} />
                  </>
                ) : (
                  <p className="col-span-2 py-6 text-center text-[13px] text-subtle">Sem despesas no período.</p>
                )}
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Recebimentos por forma" />
              <CardBody className="space-y-2.5 pt-3">
                {byMethod.length ? (
                  byMethod.map((m) => (
                    <div key={m.name}>
                      <div className="mb-1 flex justify-between text-[12.5px]">
                        <span className="text-muted">{m.name}</span>
                        <span className="font-medium tabular">{formatCurrency(m.value)}</span>
                      </div>
                      <Progress value={summary.received ? m.value / summary.received : 0} tone="ink" />
                    </div>
                  ))
                ) : (
                  <p className="py-6 text-center text-[13px] text-subtle">Sem recebimentos no período.</p>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      ) : null}

      {tab === "receitas" ? (
        <Card className="overflow-hidden">
          <DataTable
            caption="Receitas"
            rows={rec}
            columns={receivableColumns}
            getRowId={(r) => r.id}
            initialSort={{ key: "date", dir: "desc" }}
            empty={<EmptyState icon={<Receipt />} title="Nenhuma receita lançada" action={<Button onClick={() => setReceivableOpen(true)}><Plus /> Nova receita</Button>} />}
            mobileCard={(r) => (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-medium">{lookups.patientName(r.patientId)}</p>
                  <p className="truncate text-[12px] text-subtle">{r.description}</p>
                </div>
                <span className="font-semibold tabular">{formatCurrency(receivableTotal(r))}</span>
              </div>
            )}
          />
        </Card>
      ) : null}

      {tab === "despesas" ? (
        <Card className="overflow-hidden">
          <DataTable
            caption="Despesas"
            rows={exp.filter((e) => e.date >= range.from && e.date <= range.to)}
            columns={expenseColumns}
            getRowId={(e) => e.id}
            initialSort={{ key: "date", dir: "desc" }}
            empty={<EmptyState icon={<Wallet />} title="Nenhuma despesa no período" description="Ajuste o período ou registre uma nova despesa." />}
            mobileCard={(e) => (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-medium">{e.description}</p>
                  <p className="text-[12px] text-subtle">{EXPENSE_CATEGORY_LABELS[e.category]} · {formatDate(e.date)}</p>
                </div>
                <span className="font-semibold tabular">{formatCurrency(e.amount)}</span>
              </div>
            )}
          />
        </Card>
      ) : null}

      {tab === "pagamentos" ? (
        <Card className="overflow-hidden">
          <DataTable
            caption="Pagamentos recebidos"
            rows={payments}
            columns={paymentColumns}
            getRowId={(r) => r.id}
            initialSort={{ key: "paid", dir: "desc" }}
            empty={<EmptyState title="Nenhum pagamento no período" />}
            mobileCard={(r) => (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-medium">{lookups.patientName(r.patientId)}</p>
                  <p className="text-[12px] text-subtle">{formatDate(r.paidAt)} · {PAYMENT_METHOD_LABELS[r.method]}</p>
                </div>
                <span className="font-semibold tabular text-success">{formatCurrency(r.amount)}</span>
              </div>
            )}
          />
        </Card>
      ) : null}

      {tab === "parcelas" ? (
        <Card className="overflow-hidden">
          <div className="border-b border-line p-3 sm:p-4">
            <Segmented
              size="sm"
              label="Filtrar parcelas"
              value={installmentFilter}
              onChange={setInstallmentFilter}
              options={[
                { value: "abertas", label: "Em aberto" },
                { value: "atrasado", label: "Atrasadas" },
                { value: "pendente", label: "A vencer" },
                { value: "pago", label: "Pagas" },
              ]}
            />
          </div>
          <DataTable
            caption="Parcelas"
            rows={filteredInstallments}
            columns={installmentColumns}
            getRowId={(r) => r.id}
            initialSort={{ key: "due", dir: installmentFilter === "pago" ? "desc" : "asc" }}
            empty={<EmptyState title="Nenhuma parcela neste filtro" />}
            mobileCard={(r) => (
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-medium">{lookups.patientName(r.patientId)}</p>
                    <p className="text-[12px] text-subtle">Vence {formatDate(r.dueDate)} · {r.number}/{r.totalInstallments}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold tabular">{formatCurrency(r.amount)}</p>
                    <InstallmentStatusBadge status={r.status} />
                  </div>
                </div>
                {!r.paidAt ? (
                  <div className="mt-2 flex justify-end gap-2">
                    <a href={chargeLink(r)} target="_blank" rel="noreferrer" className="inline-flex h-7 items-center gap-1 rounded-[8px] border border-line px-2 text-xs font-medium">
                      <WhatsappIcon className="size-3.5 text-[#25D366]" /> Cobrar
                    </a>
                    <Button size="xs" onClick={() => void pay(r, true)}>
                      <Check /> Dar baixa
                    </Button>
                  </div>
                ) : null}
              </div>
            )}
          />
        </Card>
      ) : null}

      <ReceivableFormDialog open={receivableOpen} onClose={() => setReceivableOpen(false)} />
      <ExpenseFormDialog open={expenseOpen} onClose={() => setExpenseOpen(false)} expense={editingExpense} />
      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title={toDelete?.kind === "receita" ? "Excluir receita?" : "Excluir despesa?"}
        description={`“${toDelete?.label}” será removido permanentemente${toDelete?.kind === "receita" ? ", incluindo todas as parcelas" : ""}.`}
        onConfirm={async () => {
          if (!toDelete) return;
          if (toDelete.kind === "receita") await financeService.removeReceivable(toDelete.id);
          else await financeService.removeExpense(toDelete.id);
          toast.success("Lançamento excluído");
        }}
      />
    </div>
  );
}
