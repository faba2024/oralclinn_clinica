"use client";

import { useMemo } from "react";
import { usePatients } from "@/features/patients/hooks";
import { useProfessionals } from "@/features/professionals/hooks";
import { professionalDisplayName } from "@/features/professionals/types";
import { useTreatments } from "@/features/treatments/hooks";
import { useUsers } from "@/features/users/hooks";

/** Mapas id → entidade para exibir nomes em tabelas e cards sem consultas repetidas. */
export function useLookups() {
  const { data: professionals = [] } = useProfessionals();
  const { data: treatments = [] } = useTreatments();
  const { data: patients = [] } = usePatients();
  const { data: users = [] } = useUsers();

  return useMemo(() => {
    const professionalMap = new Map(professionals.map((p) => [p.id, p]));
    const treatmentMap = new Map(treatments.map((t) => [t.id, t]));
    const patientMap = new Map(patients.map((p) => [p.id, p]));
    const userMap = new Map(users.map((u) => [u.id, u]));
    return {
      professionals,
      treatments,
      patients,
      users,
      professional: (id: string | null | undefined) => (id ? professionalMap.get(id) : undefined),
      professionalName: (id: string | null | undefined) => {
        const p = id ? professionalMap.get(id) : undefined;
        return p ? professionalDisplayName(p) : "—";
      },
      treatment: (id: string | null | undefined) => (id ? treatmentMap.get(id) : undefined),
      treatmentName: (id: string | null | undefined) => (id ? treatmentMap.get(id)?.name ?? "—" : "—"),
      patient: (id: string | null | undefined) => (id ? patientMap.get(id) : undefined),
      patientName: (id: string | null | undefined) => (id ? patientMap.get(id)?.name ?? "—" : "—"),
      userName: (id: string | null | undefined) => (id ? userMap.get(id)?.name ?? "—" : "—"),
    };
  }, [professionals, treatments, patients, users]);
}
