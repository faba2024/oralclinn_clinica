import type { Metadata } from "next";
import { Suspense } from "react";
import { TreatmentsView } from "@/features/treatments/components/treatments-view";

export const metadata: Metadata = { title: "Tratamentos" };

export default function TreatmentsAdminPage() {
  return (
    <Suspense>
      <TreatmentsView />
    </Suspense>
  );
}
