interface TooltipPayloadItem {
  name?: string | number;
  value?: number | string | (number | string)[];
  color?: string;
  dataKey?: string | number;
  payload?: Record<string, unknown>;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
  formatter?: (value: number) => string;
}

export function ChartTooltip({ active, payload, label, formatter }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[10px] border border-line bg-white px-3 py-2 text-[12px] shadow-[var(--shadow-pop)]">
      {label !== undefined ? <p className="mb-1 font-semibold text-ink">{label}</p> : null}
      <ul className="space-y-0.5">
        {payload.map((p) => (
          <li key={String(p.dataKey ?? p.name)} className="flex items-center gap-2 text-muted">
            <span className="size-2 rounded-full" style={{ backgroundColor: p.color }} aria-hidden />
            <span className="capitalize">{p.name}</span>
            <span className="ml-auto pl-4 font-semibold tabular text-ink">
              {formatter && typeof p.value === "number" ? formatter(p.value) : String(p.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
