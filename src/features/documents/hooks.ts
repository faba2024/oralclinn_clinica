"use client";

import { useLiveQuery } from "@/hooks/use-live-query";
import { documentService } from "./service";

export const usePatientDocuments = (patientId: string) =>
  useLiveQuery(() => documentService.listByPatient(patientId), ["documents"], [patientId]);
