"use client";

import { useLiveQuery } from "@/hooks/use-live-query";
import { recordService } from "./service";

export const useClinicalRecord = (patientId: string) =>
  useLiveQuery(() => recordService.getByPatient(patientId), ["clinical-records"], [patientId]);
export const useClinicalRecords = () => useLiveQuery(() => recordService.list(), ["clinical-records"]);
