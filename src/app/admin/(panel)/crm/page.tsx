import type { Metadata } from "next";
import { Suspense } from "react";
import { CrmView } from "@/features/crm/components/crm-view";

export const metadata: Metadata = { title: "CRM" };

export default function CrmPage() {
  return (
    <Suspense>
      <CrmView />
    </Suspense>
  );
}
