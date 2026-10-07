import { Badge } from "@/components/ui/badge";
import { INSTALLMENT_STATUS, type InstallmentStatus } from "../types";

export function InstallmentStatusBadge({ status }: { status: InstallmentStatus }) {
  const s = INSTALLMENT_STATUS[status];
  return (
    <Badge tone={s.tone} dot>
      {s.label}
    </Badge>
  );
}
