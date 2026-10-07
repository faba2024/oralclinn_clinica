import type { Metadata } from "next";
import { DashboardView } from "@/features/dashboard/components/dashboard-view";

export const metadata: Metadata = { title: "Visão geral" };

export default function AdminHomePage() {
  return <DashboardView />;
}
