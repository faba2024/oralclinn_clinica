import type { Metadata } from "next";
import { BookingsView } from "@/features/appointments/components/bookings-view";

export const metadata: Metadata = { title: "Agendamentos" };

export default function BookingsPage() {
  return <BookingsView />;
}
