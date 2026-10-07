"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { axisProps, CHART_COLORS } from "./chart-theme";
import { ChartTooltip } from "./chart-tooltip";

type Radius = [number, number, number, number];

function barRadius(flat: boolean, vertical: boolean): Radius {
  if (flat) return [0, 0, 0, 0];
  return vertical ? [0, 4, 4, 0] : [4, 4, 0, 0];
}

interface SeriesDef {
  key: string;
  name: string;
  color?: string;
  stackId?: string;
}

interface SimpleBarChartProps {
  data: Record<string, string | number>[];
  xKey: string;
  series: SeriesDef[];
  height?: number;
  formatter?: (v: number) => string;
  label: string;
  layout?: "horizontal" | "vertical";
}

export function SimpleBarChart({ data, xKey, series, height = 220, formatter, label, layout = "horizontal" }: SimpleBarChartProps) {
  const vertical = layout === "vertical";
  return (
    <div style={{ height }} role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout={vertical ? "vertical" : "horizontal"} margin={{ top: 4, right: 8, left: vertical ? 8 : -20, bottom: 0 }} barCategoryGap={vertical ? 8 : "28%"}>
          <CartesianGrid vertical={vertical} horizontal={!vertical} stroke={CHART_COLORS.grid} />
          {vertical ? (
            <>
              <XAxis type="number" {...axisProps} allowDecimals={false} tickFormatter={formatter} />
              <YAxis type="category" dataKey={xKey} {...axisProps} width={84} />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} {...axisProps} dy={6} />
              <YAxis {...axisProps} allowDecimals={false} tickFormatter={formatter} />
            </>
          )}
          <Tooltip content={<ChartTooltip formatter={formatter} />} cursor={{ fill: "rgba(214,195,156,0.15)" }} />
          {series.map((s, i) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.name}
              stackId={s.stackId}
              fill={s.color ?? (i === 0 ? CHART_COLORS.primary : CHART_COLORS.champagne)}
              radius={barRadius(!!s.stackId && i === 0, vertical)}
              maxBarSize={vertical ? 18 : 28}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
