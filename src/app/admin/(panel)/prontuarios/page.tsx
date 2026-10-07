import type { Metadata } from "next";
import { RecordsView } from "@/features/records/components/records-view";

export const metadata: Metadata = { title: "Prontuários" };

export default function RecordsPage() {
  return <RecordsView />;
}
