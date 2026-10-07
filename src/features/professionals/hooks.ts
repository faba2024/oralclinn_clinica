"use client";

import { useLiveQuery } from "@/hooks/use-live-query";
import type { DateRange } from "@/types/common";
import { professionalService } from "./service";

export const useProfessionals = () => useLiveQuery(() => professionalService.list(), ["professionals"]);
export const useProfessionalPerformance = (range: DateRange) =>
  useLiveQuery(() => professionalService.performance(range), ["professionals", "appointments", "receivables"], [range.from, range.to]);
