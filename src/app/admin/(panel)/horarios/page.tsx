import type { Metadata } from "next";
import { HoursView } from "@/features/settings/components/hours-view";

export const metadata: Metadata = { title: "Horários" };

export default function HoursPage() {
  return <HoursView />;
}
