import type { Metadata } from "next";
import { Suspense } from "react";
import { PatientProfileView } from "@/features/patients/components/patient-profile-view";

export const metadata: Metadata = { title: "Paciente" };

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense>
      <PatientProfileView id={id} />
    </Suspense>
  );
}
