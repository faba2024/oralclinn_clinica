import type { Metadata } from "next";
import { BeforeAfterAdminView } from "@/features/before-after/components/before-after-admin-view";

export const metadata: Metadata = { title: "Antes e Depois" };

export default function BeforeAfterAdminPage() {
  return <BeforeAfterAdminView />;
}
