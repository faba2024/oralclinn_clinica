import type { Metadata } from "next";
import { Suspense } from "react";
import { PatientsView } from "@/features/patients/components/patients-view";

export const metadata: Metadata = { title: "Pacientes" };

export default function PatientsPage() {
  return (
    <Suspense>
      <PatientsView />
    </Suspense>
  );
}
