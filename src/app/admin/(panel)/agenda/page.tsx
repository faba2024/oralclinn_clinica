import type { Metadata } from "next";
import { Suspense } from "react";
import { AgendaView } from "@/features/appointments/components/agenda-view";

export const metadata: Metadata = { title: "Agenda" };

export default function AgendaPage() {
  return (
    <Suspense>
      <AgendaView />
    </Suspense>
  );
}
