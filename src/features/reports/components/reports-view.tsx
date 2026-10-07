"use client";

import { Download, Printer } from "lucide-react";
import { useMemo, useState } from "react";
import { DonutChart, Legend } from "@/components/charts/donut-chart";
import { CHART_COLORS } from "@/components/charts/chart-theme";
import { SimpleBarChart } from "@/components/charts/simple-bar-chart";
import { PageHeader } from "@/components/shared/page-header";
import { PeriodFilter } from "@/components/shared/period-filter";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useLiveQuery } from "@/hooks/use-live-query";
import type { DateRange, PeriodPreset } from "@/types/common";
import { formatCurrency, formatCurrencyCompact, formatDate, formatPercent } from "@/utils/format";
import { rangeForPreset } from "../period";
import { getReport } from "../service";

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\n");
  const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ReportsView() {
  const [preset, setPreset] = useState<PeriodPreset>("30d");
  const [custom, setCustom] = useState<DateRange>(() => rangeForPreset("30d"));
  const range = useMemo(() => rangeForPreset(preset, custom), [preset, custom]);
  const { data, loading } = useLiveQuery(() => getReport(range), ["appointments", "receivables", "expenses", "patients", "leads", "treatments", "professionals"], [range.from, range.to]);

  const exportAll = () => {
    if (!data) return;
    downloadCsv(`relatorio-oralclin-${range.from}-a-${range.to}.csv`, [
      ["Relatório Oralclin", `${formatDate(range.from)} a ${formatDate(range.to)}`],
      [],
      ["Faturamento recebido", data.revenue.total.toFixed(2)],
      ["Despesas", data.revenue.expenses.toFixed(2)],
      ["Ticket médio por atendimento", data.revenue.ticket.toFixed(2)],
      [],
      ["Consultas", data.appointments.total],
      ["Finalizadas", data.appointments.done],
      ["Canceladas", data.appointments.cancelled],
      ["Faltas", data.appointments.noShow],
      ["Agendamentos online", data.appointments.online],
      [],
      ["Novos pacientes", data.patients.new],
      ["Leads", data.conversion.leads],
      ["Leads fechados", data.conversion.won],
      ["Conversão", formatPercent(data.conversion.rate, 1)],
      [],
      ["Tratamento", "Vendas", "Valor"],
      ...data.topTreatments.map((t) => [t.name, t.count, t.value.toFixed(2)]),
      [],
      ["Origem", "Leads", "Fechados", "Conversão", "Valor"],
      ...data.sources.map((s) => [s.label, s.leads, s.won, formatPercent(s.conversion, 1), s.value.toFixed(2)]),
      [],
      ["Profissional", "Procedimentos", "Pacientes", "Faltas", "Produção", "Comissão"],
      ...data.professionals.map((p) => [`${p.professional.title} ${p.professional.name}`, p.procedures, p.patients, p.noShows, p.production.toFixed(2), p.commission.toFixed(2)]),
    ]);
  };

  const a = data?.appointments;
  const cancelRate = a && a.total ? a.cancelled / a.total : 0;
  const noShowRate = a && a.total ? a.noShow / a.total : 0;

  return (
    <div className="print-area animate-fade-in">
      <PageHeader
        title="Relatórios"
        description={`Período: ${formatDate(range.from)} a ${formatDate(range.to)}`}
        actions={
          <>
            <PeriodFilter preset={preset} onPresetChange={setPreset} custom={custom} onCustomChange={setCustom} />
            <Button variant="secondary" onClick={() => window.print()} className="no-print">
              <Printer /> Imprimir
            </Button>
            <Button onClick={exportAll} disabled={!data}>
              <Download /> Exportar CSV
            </Button>
          </>
        }
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard emphasis label="Faturamento" value={formatCurrency(data?.revenue.total ?? 0)} hint={`ticket médio ${formatCurrency(data?.revenue.ticket ?? 0)}`} loading={loading && !data} />
        <StatCard label="Consultas realizadas" value={a?.done ?? 0} hint={`de ${a?.total ?? 0} agendadas`} loading={loading && !data} />
        <StatCard label="Novos pacientes" value={data?.patients.new ?? 0} hint={`${data?.patients.total ?? 0} na base`} loading={loading && !data} />
        <StatCard label="Conversão comercial" value={formatPercent(data?.conversion.rate ?? 0)} hint={`${data?.conversion.won ?? 0} de ${data?.conversion.leads ?? 0} leads`} loading={loading && !data} />
      </section>

      {!data ? (
        <Skeleton className="mt-4 h-96" />
      ) : (
        <>
          <div className="mt-4 grid gap-4 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader title="Faturamento" description={`Recebido: ${formatCurrency(data.revenue.total)} · Despesas: ${formatCurrency(data.revenue.expenses)}`} />
              <CardBody className="pt-3">
                {data.revenue.series.some((s) => s.receita > 0) ? (
                  <SimpleBarChart label="Faturamento no período" data={data.revenue.series} xKey="label" series={[{ key: "receita", name: "Receita", color: CHART_COLORS.gold }]} formatter={formatCurrencyCompact} height={260} />
                ) : (
                  <EmptyState compact title="Sem recebimentos no período" />
                )}
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Consultas por status" />
              <CardBody className="pt-3">
                {data.appointments.total ? (
                  <>
                    <DonutChart data={data.appointments.byStatus} label="Consultas por status" centerValue={String(data.appointments.total)} centerLabel="consultas" height={170} />
                    <div className="mt-4">
                      <Legend items={data.appointments.byStatus.map((s) => ({ name: s.name, value: String(s.value) }))} />
                    </div>
                  </>
                ) : (
                  <EmptyState compact title="Sem consultas no período" />
                )}
              </CardBody>
            </Card>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader title="Cancelamentos e faltas" />
              <CardBody className="space-y-4 pt-4">
                <div>
                  <div className="mb-1 flex justify-between text-[13px]">
                    <span className="text-muted">Cancelamentos</span>
                    <span className="font-semibold tabular">
                      {a?.cancelled} · {formatPercent(cancelRate, 1)}
                    </span>
                  </div>
                  <Progress value={cancelRate} tone="ink" />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-[13px]">
                    <span className="text-muted">Faltas</span>
                    <span className="font-semibold tabular">
                      {a?.noShow} · {formatPercent(noShowRate, 1)}
                    </span>
                  </div>
                  <Progress value={noShowRate} />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-[13px]">
                    <span className="text-muted">Agendamentos online</span>
                    <span className="font-semibold tabular">{a?.online}</span>
                  </div>
                  <Progress value={a && a.total ? a.online / a.total : 0} tone="success" />
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Novos pacientes por origem" />
              <CardBody className="pt-3">
                {data.patients.byOrigin.length ? (
                  <SimpleBarChart label="Novos pacientes por origem" layout="vertical" data={data.patients.byOrigin} xKey="name" series={[{ key: "value", name: "Pacientes", color: CHART_COLORS.primary }]} height={Math.max(140, data.patients.byOrigin.length * 34)} />
                ) : (
                  <EmptyState compact title="Nenhum paciente novo no período" />
                )}
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Conversão comercial" />
              <CardBody className="grid grid-cols-2 gap-3 pt-4 text-center">
                {[
                  { label: "Leads no período", value: String(data.conversion.leads) },
                  { label: "Fechados", value: String(data.conversion.won) },
                  { label: "Perdidos", value: String(data.conversion.lost) },
                  { label: "Valor fechado", value: formatCurrency(data.conversion.wonValue) },
                ].map((m) => (
                  <div key={m.label} className="rounded-[12px] bg-ivory p-3 ring-1 ring-line">
                    <p className="text-lg font-semibold tabular">{m.value}</p>
                    <p className="text-[11.5px] text-subtle">{m.label}</p>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader title="Tratamentos mais vendidos" description="Por valor lançado no período" />
              <CardBody className="pt-3">
                {data.topTreatments.length ? (
                  <ul className="space-y-3">
                    {data.topTreatments.map((t) => (
                      <li key={t.name}>
                        <div className="mb-1 flex justify-between text-[13px]">
                          <span className="font-medium">{t.name}</span>
                          <span className="tabular text-muted">
                            {t.count}x · <span className="font-semibold text-ink">{formatCurrency(t.value)}</span>
                          </span>
                        </div>
                        <Progress value={t.value / data.topTreatments[0].value} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState compact title="Sem vendas no período" />
                )}
              </CardBody>
            </Card>
            <Card className="overflow-hidden">
              <CardHeader title="Origem dos leads" description="Volume, conversão e valor fechado" />
              <CardBody className="px-0 pb-0 pt-3">
                <div className="scrollbar-thin overflow-x-auto">
                  <table className="w-full min-w-[480px] text-[13px]">
                    <thead>
                      <tr className="border-b border-line text-left text-[11px] uppercase tracking-[0.08em] text-subtle">
                        <th className="px-5 py-2 font-semibold">Origem</th>
                        <th className="px-3 py-2 text-right font-semibold">Leads</th>
                        <th className="px-3 py-2 text-right font-semibold">Fechados</th>
                        <th className="px-3 py-2 text-right font-semibold">Conversão</th>
                        <th className="px-5 py-2 text-right font-semibold">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.sources.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-5 py-8 text-center text-subtle">Sem leads no período.</td>
                        </tr>
                      ) : (
                        data.sources.map((s, i) => (
                          <tr key={s.source} className="border-b border-line/70 last:border-0">
                            <td className="px-5 py-2.5 font-medium">
                              {s.label} {i === 0 ? <span className="ml-1 rounded-full bg-gold-soft px-1.5 text-[10.5px] text-gold-dark">maior volume</span> : null}
                            </td>
                            <td className="px-3 py-2.5 text-right tabular">{s.leads}</td>
                            <td className="px-3 py-2.5 text-right tabular">{s.won}</td>
                            <td className="px-3 py-2.5 text-right tabular">{formatPercent(s.conversion)}</td>
                            <td className="px-5 py-2.5 text-right font-medium tabular">{formatCurrency(s.value)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          </div>

          <Card className="mt-4 overflow-hidden">
            <CardHeader title="Desempenho profissional" />
            <CardBody className="px-0 pb-0 pt-3">
              <div className="scrollbar-thin overflow-x-auto">
                <table className="w-full min-w-[640px] text-[13px]">
                  <thead>
                    <tr className="border-b border-line text-left text-[11px] uppercase tracking-[0.08em] text-subtle">
                      <th className="px-5 py-2 font-semibold">Profissional</th>
                      <th className="px-3 py-2 text-right font-semibold">Procedimentos</th>
                      <th className="px-3 py-2 text-right font-semibold">Pacientes</th>
                      <th className="px-3 py-2 text-right font-semibold">Faltas</th>
                      <th className="px-3 py-2 text-right font-semibold">Produção</th>
                      <th className="px-5 py-2 text-right font-semibold">Comissão</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.professionals.map((p) => (
                      <tr key={p.professional.id} className="border-b border-line/70 last:border-0">
                        <td className="px-5 py-2.5 font-medium">
                          <span className="mr-2 inline-block size-2 rounded-full" style={{ backgroundColor: p.professional.color }} />
                          {p.professional.title} {p.professional.name}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular">{p.procedures}</td>
                        <td className="px-3 py-2.5 text-right tabular">{p.patients}</td>
                        <td className="px-3 py-2.5 text-right tabular">{p.noShows}</td>
                        <td className="px-3 py-2.5 text-right font-semibold tabular">{formatCurrency(p.production)}</td>
                        <td className="px-5 py-2.5 text-right tabular">{formatCurrency(p.commission)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
