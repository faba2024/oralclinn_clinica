import { endOfMonth, format, startOfMonth, subDays, subMonths } from "date-fns";
import type { DateRange, PeriodPreset } from "@/types/common";

export const PERIOD_LABELS: Record<PeriodPreset, string> = {
  hoje: "Hoje",
  "7d": "7 dias",
  "30d": "30 dias",
  "este-mes": "Este mês",
  "ultimo-mes": "Último mês",
  personalizado: "Personalizado",
};

const iso = (d: Date) => format(d, "yyyy-MM-dd");

export function rangeForPreset(preset: PeriodPreset, custom?: DateRange): DateRange {
  const now = new Date();
  switch (preset) {
    case "hoje":
      return { from: iso(now), to: iso(now) };
    case "7d":
      return { from: iso(subDays(now, 6)), to: iso(now) };
    case "30d":
      return { from: iso(subDays(now, 29)), to: iso(now) };
    case "este-mes":
      return { from: iso(startOfMonth(now)), to: iso(endOfMonth(now)) };
    case "ultimo-mes": {
      const last = subMonths(now, 1);
      return { from: iso(startOfMonth(last)), to: iso(endOfMonth(last)) };
    }
    case "personalizado":
      return custom ?? { from: iso(startOfMonth(now)), to: iso(now) };
  }
}
