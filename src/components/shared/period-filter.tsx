"use client";

import { Input, Select } from "@/components/ui/input";
import { PERIOD_LABELS } from "@/features/reports/period";
import type { DateRange, PeriodPreset } from "@/types/common";

interface Props {
  preset: PeriodPreset;
  onPresetChange: (p: PeriodPreset) => void;
  custom: DateRange;
  onCustomChange: (r: DateRange) => void;
  presets?: PeriodPreset[];
}

export function PeriodFilter({ preset, onPresetChange, custom, onCustomChange, presets }: Props) {
  const options = presets ?? (Object.keys(PERIOD_LABELS) as PeriodPreset[]);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="w-40">
        <Select value={preset} onChange={(e) => onPresetChange(e.target.value as PeriodPreset)} aria-label="Período">
          {options.map((p) => (
            <option key={p} value={p}>
              {PERIOD_LABELS[p]}
            </option>
          ))}
        </Select>
      </div>
      {preset === "personalizado" ? (
        <div className="flex items-center gap-2">
          <Input type="date" value={custom.from} max={custom.to} onChange={(e) => onCustomChange({ ...custom, from: e.target.value })} aria-label="Data inicial" className="w-[150px]" />
          <span className="text-[12px] text-subtle">até</span>
          <Input type="date" value={custom.to} min={custom.from} onChange={(e) => onCustomChange({ ...custom, to: e.target.value })} aria-label="Data final" className="w-[150px]" />
        </div>
      ) : null}
    </div>
  );
}
