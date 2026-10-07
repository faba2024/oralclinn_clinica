"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { SERIES_PALETTE } from "./chart-theme";
import { ChartTooltip } from "./chart-tooltip";

interface DonutChartProps {
  data: { name: string; value: number }[];
  height?: number;
  label: string;
  centerLabel?: string;
  centerValue?: string;
  formatter?: (v: number) => string;
}

export function DonutChart({ data, height = 200, label, centerLabel, centerValue, formatter }: DonutChartProps) {
  return (
    <div className="relative" style={{ height }} role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<ChartTooltip formatter={formatter} />} />
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="68%" outerRadius="94%" paddingAngle={2} stroke="none">
            {data.map((_, i) => (
              <Cell key={i} fill={SERIES_PALETTE[i % SERIES_PALETTE.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {centerValue ? (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-semibold tabular">{centerValue}</span>
          {centerLabel ? <span className="text-[11px] text-subtle">{centerLabel}</span> : null}
        </div>
      ) : null}
    </div>
  );
}

export function Legend({ items }: { items: { name: string; value: string }[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={item.name} className="flex items-center gap-2 text-[12.5px]">
          <span className="size-2 rounded-full" style={{ backgroundColor: SERIES_PALETTE[i % SERIES_PALETTE.length] }} aria-hidden />
          <span className="text-muted">{item.name}</span>
          <span className="ml-auto font-medium tabular text-ink">{item.value}</span>
        </li>
      ))}
    </ul>
  );
}
