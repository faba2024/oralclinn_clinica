"use client";

import { useLiveQuery } from "@/hooks/use-live-query";
import { patientService } from "./service";

const WATCH = ["patients", "appointments", "receivables", "treatment-plans", "treatments"];

export const usePatients = () => useLiveQuery(() => patientService.list(), ["patients"]);
export const usePatientOverviews = () => useLiveQuery(() => patientService.listOverviews(), WATCH);
export const usePatientOverview = (id: string) => useLiveQuery(() => patientService.getOverview(id), WATCH, [id]);
