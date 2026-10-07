"use client";

import { useLiveQuery } from "@/hooks/use-live-query";
import { appointmentService } from "./service";

export const useAppointments = () => useLiveQuery(() => appointmentService.list(), ["appointments"]);
export const useAppointmentsRange = (from: string, to: string) =>
  useLiveQuery(() => appointmentService.listRange(from, to), ["appointments"], [from, to]);
export const usePatientAppointments = (patientId: string) =>
  useLiveQuery(() => appointmentService.listByPatient(patientId), ["appointments"], [patientId]);
