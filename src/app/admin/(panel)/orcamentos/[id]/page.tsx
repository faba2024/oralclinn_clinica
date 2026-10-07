import type { Metadata } from "next";
import { BudgetEditorView } from "@/features/budgets/components/budget-editor-view";

export const metadata: Metadata = { title: "Orçamento" };

export default async function BudgetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BudgetEditorView id={id} />;
}
