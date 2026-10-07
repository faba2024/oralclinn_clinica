"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MonthlyPoint } from "@/features/finance/service";
import { formatCurrency, formatCurrencyCompact } from "@/utils/format";
import { axisProps, CHART_COLORS } from "./chart-theme";
import { ChartTooltip } from "./chart-tooltip";

export function RevenueChart({ data, height = 260, showExpenses = true }: { data: MonthlyPoint[]; height?: number; showExpenses?: boolean }) {
  return (
    <div style={{ height }} role="img" aria-label="Gráfico de faturamento mensal">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.gold} stopOpacity={0.28} />
              <stop offset="100%" stopColor={CHART_COLORS.gold} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
          <XAxis dataKey="label" {...axisProps} dy={6} />
          <YAxis {...axisProps} tickFormatter={(v: number) => formatCurrencyCompact(v)} width={64} />
          <Tooltip content={<ChartTooltip formatter={formatCurrency} />} cursor={{ stroke: CHART_COLORS.sand }} />
          <Area type="monotone" dataKey="receita" name="Receita" stroke={CHART_COLORS.gold} strokeWidth={2} fill="url(#gradReceita)" activeDot={{ r: 4, strokeWidth: 0 }} />
          {showExpenses ? (
            <Area type="monotone" dataKey="despesa" name="Despesa" stroke={CHART_COLORS.primary} strokeWidth={1.5} strokeDasharray="4 4" fill="transparent" activeDot={{ r: 3, strokeWidth: 0 }} />
          ) : null}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
