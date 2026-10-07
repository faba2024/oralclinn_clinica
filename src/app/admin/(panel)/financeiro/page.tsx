import type { Metadata } from "next";
import { Suspense } from "react";
import { FinanceView } from "@/features/finance/components/finance-view";

export const metadata: Metadata = { title: "Financeiro" };

export default function FinancePage() {
  return (
    <Suspense>
      <FinanceView />
    </Suspense>
  );
}
