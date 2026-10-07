import type { Metadata } from "next";
import { Suspense } from "react";
import { ProfessionalsView } from "@/features/professionals/components/professionals-view";

export const metadata: Metadata = { title: "Profissionais" };

export default function ProfessionalsPage() {
  return (
    <Suspense>
      <ProfessionalsView />
    </Suspense>
  );
}
