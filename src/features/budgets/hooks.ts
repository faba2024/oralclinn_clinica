"use client";

import { useLiveQuery } from "@/hooks/use-live-query";
import { budgetService } from "./service";

export const usePlans = () => useLiveQuery(() => budgetService.list(), ["treatment-plans"]);
export const usePlan = (id: string) => useLiveQuery(() => budgetService.get(id), ["treatment-plans"], [id]);
export const usePatientPlans = (patientId: string) =>
  useLiveQuery(() => budgetService.listByPatient(patientId), ["treatment-plans"], [patientId]);
