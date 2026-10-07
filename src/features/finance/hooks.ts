"use client";

import { useLiveQuery } from "@/hooks/use-live-query";
import { financeService } from "./service";

export const useReceivables = () => useLiveQuery(() => financeService.listReceivables(), ["receivables"]);
export const useExpenses = () => useLiveQuery(() => financeService.listExpenses(), ["expenses"]);
export const usePatientReceivables = (patientId: string) =>
  useLiveQuery(() => financeService.listByPatient(patientId), ["receivables"], [patientId]);
