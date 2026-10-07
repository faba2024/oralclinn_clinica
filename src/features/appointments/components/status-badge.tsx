import { Badge } from "@/components/ui/badge";
import { APPOINTMENT_STATUS, type AppointmentStatus } from "../types";

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const s = APPOINTMENT_STATUS[status];
  return (
    <Badge tone={s.tone} dot>
      {s.label}
    </Badge>
  );
}
